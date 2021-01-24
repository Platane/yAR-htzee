import * as CANNON from "cannon-es";
import { stepSpring } from "./spring";
import { createNanoEvents, Emitter } from "nanoevents";
import * as THREE from "three";
import { MathUtils } from "three";

const stepDuration = 1 / 60;

const worldSimulationSpeed = 2;

const springParams = { tension: 120, friction: 12 };

export const nDice = 1;

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

  let status: "pre-roll" | "rolling" | "picking" = "pre-roll";

  const step = (dt_: number) => {
    const dt = Math.min(dt_, stepDuration * 3);

    if (status === "pre-roll") {
      stepSpring(pullSpring, springParams, pullSpring.target, dt);

      //
    } else if (status === "rolling") {
      world.step(stepDuration, dt * worldSimulationSpeed);

      for (const dice of dices)
        if (dice.velocity.lengthSquared() > 0.1) deltaStable = 0;

      deltaStable += dt;

      if (deltaStable > 0.5) {
        status = "picking";

        pullSpring.target = 0;
        pullSpring.x = 0;
        pullSpring.v = 0;

        for (let i = dices.length; i--; )
          diceValues[i] = getUpFace(dices[i].quaternion);

        ee.emit("rolling-stable", diceValues);
      }

      //
    } else if (status === "picking") {
      stepSpring(pullSpring, springParams, pullSpring.target, dt);
      world.step(stepDuration, dt * worldSimulationSpeed);
    }
  };

  const setPullX = (x: number) => {
    if (status === "pre-roll") {
      pullSpring.target = MathUtils.clamp(-x * 2, 0, 10);
      if (pullSpring.target > 0.9) {
        roll();
      }
    } else if (status === "picking") {
      pullSpring.target = MathUtils.clamp(x * 2, 0, 1);
    }
  };

  const roll = () => {
    ee.emit("rolling-start");

    status = "rolling";

    for (const dice of dices) {
      const k = pullSpring.x;

      A.copy(dice.pull.inHand.position);
      cameraRotationMatrix.vmult(A, A);
      cameraPosition.vadd(A, A);

      B.copy(dice.pull.edge.position);
      cameraRotationMatrix.vmult(B, B);
      cameraPosition.vadd(B, B);

      E.copy(A);
      E.lerp(B, k, E);

      dice.position.copy(E);

      dice.applyImpulse(
        new CANNON.Vec3(0, 0, -1),
        new CANNON.Vec3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        )
      );
      dice.applyForce(new CANNON.Vec3(0, 0, -80), new CANNON.Vec3(0, 0, 0));
    }
  };

  const release = () => {
    if (status === "pre-roll") pullSpring.target = 0;
    if (status === "picking") {
      if (pullSpring.x > 0.8) {
        pullSpring.x = 0;
        pullSpring.v = 0;
        status = "pre-roll";
      }
      pullSpring.target = 0;
    }
  };

  const setPickedDice = (diceIndices: number[]) => {
    // if (status === "picking") {
    // }
  };

  const A = new CANNON.Vec3();
  const B = new CANNON.Vec3();
  const E = new CANNON.Vec3();
  const copy = (i: number, target: THREE.Object3D) => {
    const dice = dices[i];

    if (status === "rolling") {
      target.position.copy(dice.position as any);
      target.setRotationFromQuaternion(dice.quaternion as any);

      //
    } else if (status === "pre-roll") {
      const k = pullSpring.x;

      A.copy(dice.pull.inHand.position);
      cameraRotationMatrix.vmult(A, A);
      cameraPosition.vadd(A, A);

      B.copy(dice.pull.edge.position);
      cameraRotationMatrix.vmult(B, B);
      cameraPosition.vadd(B, B);

      E.copy(A);
      E.lerp(B, k, E);

      target.position.copy(E as any);

      //
    } else if (status === "picking") {
      const k = 1 - pullSpring.x;

      A.copy(dice.pull.inHand.position);
      cameraRotationMatrix.vmult(A, A);
      cameraPosition.vadd(A, A);

      B.copy(dice.position);

      E.copy(A);
      E.lerp(B, k, E);

      target.position.copy(E as any);
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
    copy,
    updateCamera,
    step,
    release,
    setPullX,
    setPickedDice,
  };
  const ee: Emitter & typeof api = Object.assign(createNanoEvents(), api);

  return ee;
};

const m = new CANNON.Mat3();
const up = new CANNON.Vec3(0, 1, 0);
const getUpFace = (q: CANNON.Quaternion) => {
  up.copy(CANNON.Vec3.UNIT_Y);
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
