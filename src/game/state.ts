import * as CANNON from "cannon-es";
import { clamp } from "three/src/math/MathUtils";
import { type Category, isScoreSheetFinished } from "../gameRules/types";
import { stepSpring } from "./spring";
import { getDiceUpFace, isBodySleeping, isDiceFlat } from "./getDiceUpFace";
import { getCrumbledCubes } from "./getCrumbledCubes";
import {
  type Game,
  createEmptyGame as createRGame,
  isBlank,
  nDice,
  selectCategoryForDiceRoll,
  setRoll,
  startRolling,
  togglePickedDice,
  validateReroll,
} from "../gameRules/game";

export const createGameWorld = () => {
  //
  // CANNON world
  //

  // world
  const world = new CANNON.World();
  world.gravity.set(0, -1, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // ground
  const groundShape = new CANNON.Plane();
  const ground = new CANNON.Body({
    mass: 0,
    type: CANNON.BODY_TYPES.STATIC,
  });
  ground.addShape(
    groundShape,
    new CANNON.Vec3(0, 0, 0),
    new CANNON.Quaternion(-0.7071, 0, 0, 0.7071)
  );
  world.addBody(ground);

  // dices
  const diceShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  const bodies = Array.from({ length: nDice }, () => {
    const body = new CANNON.Body({ mass: 1 });
    body.addShape(diceShape);
    world.addBody(body);
    return body;
  });

  //
  // init state
  //

  const state = {
    game: createRGame(),
    throw: { x: 0, v: 0, target: 0 },
    pull: { x: 1, v: 0, target: 1 },
    camera: new CANNON.Transform(),
    dices: bodies.map((body) => ({
      stepSinceImmobile: 0,
      physical: body,
      crumbled: new CANNON.Transform(),
      thrown: new CANNON.Transform(),
    })),
  };

  const crumbled = getCrumbledCubes({ n: nDice });
  for (let i = nDice; i--; ) {
    copyTransform(crumbled[i], state.dices[i].crumbled);
    state.dices[i].crumbled.position.y += -2;
    state.dices[i].crumbled.position.z += -3;

    state.dices[i].thrown.position.set(
      state.dices[i].crumbled.position.x * 1.6,
      state.dices[i].crumbled.position.y * 1.1 + 0.6,
      state.dices[i].crumbled.position.z - 4
    );
    state.dices[i].thrown.quaternion
      .set(Math.random(), Math.random(), Math.random(), 1)
      .normalize();
  }

  const throwDices = () => {
    for (let i = nDice; i--; ) {
      const body = state.dices[i].physical;

      if (!state.game.pickedDice[i]) {
        body.mass = 6;
        continue;
      }

      body.force.setZero();
      body.velocity.setZero();
      body.angularVelocity.setZero();
      body.mass = 1;
      state.dices[i].stepSinceImmobile = 0;

      state.pull.x = 1;
      getConstraintPosition(state.dices[i], body);

      const forceDirection = v;
      forceDirection.copy(CANNON.Vec3.UNIT_Z);

      state.camera.quaternion.vmult(forceDirection, forceDirection);
      forceDirection.y = -0.6;
      forceDirection.normalize();

      // apply a force to the center
      const impulsePoint = w;
      const force = u;
      forceDirection.scale(-20, force);
      impulsePoint.set(0, 0, 0);
      body.applyForce(force, impulsePoint);

      // apply a force to a random point, to impulse a rotation
      const a = Math.random() * Math.PI * 2;
      impulsePoint.set(Math.sin(a) * 0.9, Math.cos(a) * 0.9, 0.9);
      forceDirection.scale(-0.5, force);
      body.applyImpulse(force, impulsePoint);
    }

    // TODO: reset crumbled position
    // or actually just rotate, because it's costly to recompute

    state.pull.x = state.pull.v = state.pull.target = 0;
    state.throw.x = state.throw.v = state.throw.target = 0;
  };

  const getConstraintPosition = (
    o: { physical: Transform; crumbled: Transform; thrown: Transform },
    out: Transform
  ) => {
    // position on floor
    const floor = o.physical;

    // position on hand
    // it's the crumbled position locked to the camera view
    const hand = a;
    composeTransform(state.camera, o.crumbled, hand);

    // position end of throw
    // it's the thrown position following the camera on Y axis ( so z is always in the horizontal plane )
    const thrown = b;

    const flatCamera = c;
    copyTransform(state.camera, flatCamera);
    flatCamera.quaternion.x = flatCamera.quaternion.z = 0;
    flatCamera.quaternion.normalize();

    composeTransform(flatCamera, o.thrown, thrown);

    // interpolate based on the user input
    lerpTransform(state.pull.x, floor, hand, out);
    lerpTransform(state.throw.x, out, thrown, out);
  };

  const getPosition = (diceIndex: number, out: Transform) => {
    if (state.game.pickedDice[diceIndex])
      getConstraintPosition(state.dices[diceIndex], out);
    else copyTransform(state.dices[diceIndex].physical, out);
  };

  const step = (dt: number) => {
    if (!state.game.roll.some(isBlank)) {
      world.step(PHYSIC_DT);

      for (const o of state.dices) {
        if (!isBodySleeping(o.physical)) o.stepSinceImmobile = 0;
        else o.stepSinceImmobile++;
      }

      const roll = state.dices.map(({ physical, stepSinceImmobile }) =>
        stepSinceImmobile > 6 ? getDiceUpFace(physical.quaternion) : "rolling"
      );

      state.game = setRoll(state.game, roll);
    }

    stepSpring(state.throw, springParams, dt);
    stepSpring(state.pull, springParams, dt);

    // transitions
    if (state.game.roll.some(isBlank)) {
      if (state.throw.target > 0.7 && state.throw.v > 0.8) {
        throwDices();
        state.game = startRolling(state.game);
      }
    } else {
      if (
        state.pull.target > 0.7 &&
        state.pull.v > 0.8 &&
        state.game !== validateReroll(state.game)
      ) {
        state.pull.target = 1;
        state.game = validateReroll(state.game);
      }
    }
  };

  //
  // setters
  //
  const setCamera = (position: Vec, quaternion: Quat) => {
    state.camera.position.copy(position as any);
    state.camera.quaternion.copy(quaternion as any);
  };
  const setRollPush = (v: number) => {
    if (isScoreSheetFinished(state.game.scoreSheet)) return;
    state.throw.target = clamp(-v * 1.8, -0.01, 1);
  };
  const releaseRollPush = () => {
    if (state.throw.target > 0.5) {
      throwDices();
      state.game = startRolling(state.game);
    } else state.throw.target = 0;
  };
  const setPickingPull = (v: number) => {
    if (isScoreSheetFinished(state.game.scoreSheet)) return;
    state.pull.target = clamp(v * 1.8, -0.01, 1);
  };
  const releasePickingPull = () => {
    if (state.pull.target > 0.5 && state.game !== validateReroll(state.game)) {
      state.game = validateReroll(state.game);
      state.pull.target = 1;
    } else state.pull.target = 0;
  };

  return {
    step,
    setCamera,
    setPickingPull,
    releasePickingPull,
    setRollPush,
    releaseRollPush,
    selectCategoryForDiceRoll(category: Category) {
      if (state.game !== selectCategoryForDiceRoll(state.game, category)) {
        state.game = selectCategoryForDiceRoll(state.game, category);
        state.pull.x = 0;
        state.pull.target = 1;
      }
    },
    toggleDicePicked(diceIndex: number) {
      state.game = togglePickedDice(state.game, diceIndex);
    },
    state: state as { game: Game },
    getPosition,
  };
};

const springParams = { tension: 120, friction: 12 };

const PHYSIC_DT = (1 / 60) * 5;

const a = new CANNON.Transform();
const b = new CANNON.Transform();
const c = new CANNON.Transform();
const v = new CANNON.Vec3();
const u = new CANNON.Vec3();
const w = new CANNON.Vec3();

export type Vec = { x: number; y: number; z: number };
export type Quat = { x: number; y: number; z: number; w: number };
export type Transform = {
  position: Vec;
  quaternion: Quat;
};

const lerpTransform = (
  k: number,
  a: Transform,
  b: Transform,
  out: Transform
) => {
  CANNON.Vec3.prototype.lerp.call(
    a.position,
    b.position as any,
    k,
    out.position as any
  );
  CANNON.Quaternion.prototype.slerp.call(
    a.quaternion,
    b.quaternion as any,
    k,
    out.quaternion as any
  );
};
const copyTransform = (source: Transform, out: Transform) => {
  CANNON.Vec3.prototype.copy.call(out.position, source.position as any);
  CANNON.Quaternion.prototype.copy.call(
    out.quaternion,
    source.quaternion as any
  );
};
const composeTransform = (a: Transform, b: Transform, out: Transform) => {
  CANNON.Quaternion.prototype.vmult.call(
    a.quaternion,
    b.position as any,
    out.position as any
  );
  CANNON.Vec3.prototype.vadd.call(
    a.position,
    out.position as any,
    out.position as any
  );

  CANNON.Quaternion.prototype.mult.call(
    a.quaternion,
    b.quaternion as any,
    out.quaternion as any
  );
};
