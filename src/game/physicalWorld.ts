import * as CANNON from "cannon-es";
import { stepSpring } from "./spring";
import { createNanoEvents, Emitter } from "nanoevents";
import * as THREE from "three";
import { MathUtils } from "three";

const stepDuration = 1 / 60;

const worldSimulationSpeed = 3;

const springParams = { tension: 120, friction: 12 };

export const nDice = 5;

export const createWorld = () => {
  const world = new CANNON.World();
  world.gravity.set(0, -1, 0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // ground
  let ground: CANNON.Body;
  {
    const planeShape = new CANNON.Plane();
    ground = new CANNON.Body({
      mass: 0,
      type: CANNON.BODY_TYPES.STATIC,
    });
    const quat = new CANNON.Quaternion().setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
    const position = new CANNON.Vec3(0, 0, 0);
    ground.addShape(planeShape, position, quat);
    world.addBody(ground);
  }

  // dices
  type Pose = { position: CANNON.Vec3; quaternion: CANNON.Quaternion };
  const dices: (CANNON.Body & {
    pull: { edge: Pose; inHand: Pose; spring: CANNON.Spring };
    picked: boolean;
  })[] = [];
  {
    const size = new CANNON.Vec3(0.5, 0.5, 0.5);
    const shape = new CANNON.Box(size);
    for (let n = nDice; n--; ) {
      const body: any = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3((n % 3) - 1, 0.5, Math.floor(n / 3)),
      });
      body.addShape(shape);
      world.addBody(body);

      const o = new CANNON.Vec3((n % 3) - 1, Math.floor(n / 3), 0);

      body.pull = {
        spring: new CANNON.Spring(body, ground, {
          localAnchorA: new CANNON.Vec3(),
          localAnchorB: new CANNON.Vec3(),
          restLength: 0,
          stiffness: 100,
          damping: 100,
        }),

        inHand: {
          position: o.scale(0.5).vadd(new CANNON.Vec3(0, -1.7, -2)),
          quaternion: new CANNON.Quaternion().setFromEuler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          ),
        },
        edge: {
          position: o
            .scale(1.6)
            .addScaledVector(-4 + 2 * Math.random(), CANNON.Vec3.UNIT_Z),
          quaternion: new CANNON.Quaternion().setFromEuler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          ),
        },
      };

      dices.push(body);
    }
  }

  // state
  const cameraPosition = new CANNON.Vec3();
  const cameraDirection = new CANNON.Vec3();
  const cameraRotationMatrix = new CANNON.Mat3();

  // x=0  -> dice is on the board
  // x=1  -> dice is in hand
  const pullSpring = { x: 0, v: 0, target: 0 };

  // x=0  -> dice is in hand
  // x=1  -> dice is on edge
  const pushSpring = { x: 0, v: 0, target: 0 };

  let deltaStable = 0;

  let status: "pre-roll" | "rolling" | "picking" = "pre-roll";

  const reset = () => {
    pushSpring.target = 0;
    pushSpring.x = 0;
    pushSpring.v = 0;
    pullSpring.target = 1;
    status = "pre-roll";
    ee.emit("status-changed", status);
  };

  const step = (dt_: number) => {
    const dt = Math.min(dt_, stepDuration * 3);

    stepSpring(pullSpring, springParams, pullSpring.target, dt);
    stepSpring(pushSpring, springParams, pushSpring.target, dt);

    if (status === "pre-roll") {
      if (pushSpring.x > 0.8) roll();

      //
    } else if (status === "rolling") {
      world.step(stepDuration, dt * worldSimulationSpeed);

      for (const dice of dices)
        if (
          dice.velocity.lengthSquared() > 0.1 ||
          dice.angularVelocity.lengthSquared() > 0.01
        )
          deltaStable = 0;

      deltaStable += dt;

      if (deltaStable > 0.5) {
        status = "picking";
        ee.emit(
          "status-changed",
          status,
          dices.map((d) => getUpFace(d.quaternion))
        );
      }

      //
    } else if (status === "picking") {
      world.step(stepDuration, dt * worldSimulationSpeed);
    }
  };

  const setPullX = (x: number) => {
    if (status === "pre-roll") {
      pushSpring.target = MathUtils.clamp(-x * 2, 0, 10);
    } else if (status === "picking" && dices.some((d) => d.picked)) {
      pullSpring.target = MathUtils.clamp(x * 2, 0, 1);
    }
  };

  const roll = () => {
    status = "rolling";
    ee.emit("status-changed", status);

    for (const dice of dices) {
      if (!dice.picked) continue;

      cameraLocalToWorld(dice.pull.inHand.position, inHand);
      cameraLocalToWorld(dice.pull.edge.position, pushEdge);

      E.copy(CANNON.Vec3.ZERO);
      E.copy(inHand);
      E.lerp(dice.position, 1 - pullSpring.x, E);
      E.lerp(pushEdge, pushSpring.x, E);

      dice.position.copy(E);

      const forceDirection = CANNON.Vec3.UNIT_Z.clone();
      cameraRotationMatrix.vmult(forceDirection, forceDirection);
      forceDirection.y = 0;
      forceDirection.normalize();

      dice.applyImpulse(
        forceDirection.scale(-1.3),
        new CANNON.Vec3(Math.random() - 0.5, Math.random() - 0.5, 0.9)
      );
      dice.applyForce(forceDirection.scale(-70), new CANNON.Vec3(0, 0, 0));
    }

    pushSpring.target = 0;
    pushSpring.x = 0;
    pushSpring.v = 0;

    pullSpring.x = 0;
    pullSpring.target = 0;
    pullSpring.v = 0;
  };

  const release = () => {
    if (status === "pre-roll") {
      if (pushSpring.target > 0.7) pushSpring.target = 1;
      else pushSpring.target = 0;
    }
    if (status === "picking") {
      if (pullSpring.x > 0.8) {
        pullSpring.target = 1;
        status = "pre-roll";
        ee.emit("status-changed", status);
      } else pullSpring.target = 0;
    }
  };

  const setPickedDice = (diceIndices: number[]) => {
    for (const dice of dices) {
      dice.picked = false;
      dice.mass = 5;
    }

    diceIndices.forEach((i) => {
      dices[i].picked = true;
      dices[i].mass = 1;
    });
  };

  // TODO use transform instead
  const inHand = new CANNON.Vec3();
  const pushEdge = new CANNON.Vec3();
  const E = new CANNON.Vec3();

  const cameraLocalToWorld = (A: CANNON.Vec3, target: CANNON.Vec3) => {
    target.copy(A);
    cameraRotationMatrix.vmult(target, target);
    cameraPosition.vadd(target, target);
  };

  const copy = (i: number, target?: THREE.Object3D) => {
    if (!target) return;

    const dice = dices[i];

    if (status === "rolling" || !dice.picked) {
      target.position.copy(dice.position as any);
      target.setRotationFromQuaternion(dice.quaternion as any);

      //
    } else if (status === "picking" || status === "pre-roll") {
      cameraLocalToWorld(dice.pull.inHand.position, inHand);
      cameraLocalToWorld(dice.pull.edge.position, pushEdge);

      E.copy(CANNON.Vec3.ZERO);
      E.copy(inHand);
      E.lerp(dice.position, 1 - pullSpring.x, E);
      E.lerp(pushEdge, pushSpring.x, E);

      target.position.copy(E as any);

      const Eq = new CANNON.Quaternion();
      Eq.copy(dice.pull.inHand.quaternion);
      Eq.slerp(dice.quaternion, 1 - pullSpring.x, Eq);
      Eq.slerp(dice.pull.edge.quaternion, pushSpring.x, Eq);

      target.setRotationFromQuaternion(Eq as any);
      //
    }
  };

  const z = new THREE.Vector3();
  const mat3 = new THREE.Matrix3();
  const updateCamera = (camera: THREE.Camera) => {
    mat3.setFromMatrix4(camera.matrixWorld).invert();
    cameraRotationMatrix.copy(mat3 as any);
    cameraPosition.copy(camera.position as any);
    camera.getWorldDirection(z);
    cameraDirection.copy(z as any);
  };

  const api = {
    reset,
    copy,
    updateCamera,
    step,
    release,
    setPullX,
    setPickedDice,
  };
  const ee: Emitter<{
    "status-changed": (s: typeof status, x?: any) => void;
  }> &
    typeof api = Object.assign(createNanoEvents(), api);

  return ee;
};

const m = new CANNON.Mat3();
const up = new CANNON.Vec3(0, 1, 0);
const getUpFace = (q: CANNON.Quaternion) => {
  up.copy(CANNON.Vec3.UNIT_Y);
  m.setRotationFromQuaternion(q);
  m.reverse(m);
  m.vmult(up, up);

  let value = 0;
  let d = 0;

  if (up.x > d) {
    d = up.x;
    value = 2;
  }
  if (-up.x > d) {
    d = -up.x;
    value = 5;
  }
  if (up.y > d) {
    d = up.y;
    value = 1;
  }
  if (-up.y > d) {
    d = -up.y;
    value = 6;
  }
  if (up.z > d) {
    d = up.z;
    value = 4;
  }
  if (-up.z > d) {
    d = -up.z;
    value = 3;
  }
  return value;
};
