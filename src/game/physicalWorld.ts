import * as CANNON from "cannon-es";
import { stepSpring } from "./spring";

const stepDuration = 1 / 60;

const springParams = { tension: 120, friction: 12 };

const nDice = 1;

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
  })[] = [];
  {
    const size = new CANNON.Vec3(0.5, 0.5, 0.5);
    const shape = new CANNON.Box(size);
    for (let n = nDice; n--; ) {
      const body: any = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(Math.random(), 0.5 + n * 3, Math.random()),
      });
      body.addShape(shape);
      world.addBody(body);

      body.pull = {
        spring: new CANNON.Spring(body, ground, {
          localAnchorA: new CANNON.Vec3(),
          localAnchorB: new CANNON.Vec3(),
          restLength: 0,
          stiffness: 100,
          damping: 100,
        }),

        inHand: {
          position: new CANNON.Vec3(Math.random() - 0.5, -1, -1),
          quaternion: new CANNON.Quaternion().setFromEuler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          ),
        },
        edge: {
          position: new CANNON.Vec3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            -(Math.random() + 6) * 0.7
          ),
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
  const diceValues = dices.map((body) => getUpFace(body.quaternion));

  const pullSpring = { x: 0, v: 0, target: 0 };

  let deltaStable = 0;

  const state: State = {
    status: "pre-roll",
    picked: [0, 1, 2, 3, 5],

    pushX: 0,
  };

  const step = (dt_: number) => {
    const dt = Math.min(dt_, stepDuration * 3);

    if (state.status === "pre-roll") {
      stepSpring(pullSpring, springParams, pullSpring.target, dt);

      const k = pullSpring.x;

      const A = new CANNON.Vec3();
      const B = new CANNON.Vec3();
      const E = new CANNON.Vec3();

      for (const dice of dices) {
        A.copy(dice.pull.inHand.position);
        cameraRotationMatrix.vmult(A, A);
        cameraPosition.vadd(A, A);

        B.copy(dice.pull.edge.position);
        cameraRotationMatrix.vmult(B, B);
        cameraPosition.vadd(B, B);

        E.copy(A);
        E.lerp(B, k, E);

        dice.pull.spring.setWorldAnchorB(E);
        // dice.pull.spring.applyForce();
        dice.position.copy(E);
      }
    } else if (state.status === "rolling") {
      world.step(stepDuration, dt);

      //
      // //
      // for (let i = dices.length; i--; ) {
      //   const { quaternion, position } = dices[i];
      //   const v = getUpFace(quaternion);
      //   if (diceValues[i] !== v || position.y > 2) {
      //     diceValues[i] = v;
      //     deltaStable = 0;
      //   }
      // }
      // deltaStable += dt;
      // if (deltaStable > 1.2) {
      // }
    }
  };

  // const roll = (diceIndexes: number[]) => {
  //   dices.forEach((body, i) => {
  //     if (diceIndexes.includes(i)) {
  //       meshBounds;
  //     } else {
  //       body.mass = 0;
  //       body.updateMassProperties();
  //     }
  //   });
  // };

  const setPullX = (x: number) => {
    if (state.status === "pre-roll") {
      pullSpring.target = -x;
      if (-x > 0.5) roll();
    }
  };

  const roll = () => {
    Object.assign(state, { status: "rolling", stable: false });

    for (const dice of dices) {
      dice.velocity.set(0, 0, -1);
      dice.applyImpulse(
        new CANNON.Vec3(0, 0 - 3),
        new CANNON.Vec3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        )
      );
      dice.applyForce(new CANNON.Vec3(0, 0, -120), new CANNON.Vec3(0, 0, 0));
      // dice.angularVelocity.set(
      //   (Math.random() - 0.5) * 10,
      //   (Math.random() - 0.5) * 10,
      //   (Math.random() - 0.5) * 10
      // );
    }
  };

  const release = () => {
    if (state.status === "pre-roll") pullSpring.target = 0;
  };

  const setPickedDice = (diceIndices: number[]) => {
    if (state.status === "picking") {
    }
  };

  return {
    step,
    release,
    setPullX,
    setPickedDice,

    dices,
    diceValues,
    cameraPosition,
    cameraDirection,
    cameraRotationMatrix,
  };
};

type State =
  | { status: "rolling"; stable: boolean }
  | { status: "picking"; picked: number[]; pullX: number }
  | {
      status: "pre-roll";
      picked: number[];
      pushX: number;
    };

const m = new CANNON.Mat3();
const up = new CANNON.Vec3(0, 1, 0);
const getUpFace = (q: CANNON.Quaternion) => {
  up.set(0, 1, 0);
  m.setRotationFromQuaternion(q);
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
