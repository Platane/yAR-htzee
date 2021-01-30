import * as CANNON from "cannon-es";
import { stepSpring } from "./spring";
import { createNanoEvents, Emitter } from "nanoevents";
import * as THREE from "three";
import { MathUtils } from "three";
import { getDiceUpFace } from "./getDiceUpFace";
import { nDice } from "./types";
import { getPhysicalHand } from "./physicalHand";

const stepDuration = 2 / 60;

const worldSimulationSpeed = 4;

const springParams = { tension: 120, friction: 12 };

export const createWorld = () => {
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
    new CANNON.Quaternion().setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    )
  );
  world.addBody(ground);

  // dices
  const diceShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  const dices = Array.from({ length: nDice }, (_, i) => {
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3((i - length / 2) * 1.2),
    });
    body.addShape(diceShape);
    world.addBody(body);

    const o = new CANNON.Vec3((i % 3) - 1, Math.floor(i / 3), 0);

    return Object.assign(body, {
      picked: true,
      inHand: new CANNON.Transform({
        position: o.scale(0.5).vadd(new CANNON.Vec3(0, -1.7, -2)),
        quaternion: new CANNON.Quaternion().setFromEuler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
      }),
      edge: new CANNON.Transform({
        position: o
          .scale(1.6)
          .addScaledVector(-3 + 2 * Math.random(), CANNON.Vec3.UNIT_Z),
        quaternion: new CANNON.Quaternion().setFromEuler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
      }),
    });
  });

  getPhysicalHand(dices as any).inHand.forEach((t, i) => {
    dices[i].inHand.position.copy(
      t.position.vadd(new CANNON.Vec3(0, -1.25, -2.2))
    );
    dices[i].inHand.quaternion.copy(t.quaternion);
  });

  // state
  const cameraTransform = new CANNON.Transform();

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
          dices.map((d) => getDiceUpFace(d.quaternion))
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

      cameraTransform.pointToWorld(dice.inHand.position, inHand);
      cameraTransform.pointToWorld(dice.edge.position, pushEdge);

      E.copy(inHand);
      E.lerp(dice.position, 1 - pullSpring.x, E);
      E.lerp(pushEdge, pushSpring.x, E);

      dice.position.copy(E);

      const forceDirection = CANNON.Vec3.UNIT_Z.clone();

      cameraTransform.quaternion.vmult(forceDirection, forceDirection);
      forceDirection.y = 0;
      forceDirection.normalize();
      forceDirection.y = -0.6;
      forceDirection.normalize();

      dice.applyImpulse(
        forceDirection.scale(-0.8),
        new CANNON.Vec3(Math.random() - 0.5, Math.random() - 0.5, 0.9)
      );
      dice.applyForce(forceDirection.scale(-35), new CANNON.Vec3(0, 0, 0));
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

  const copy = (i: number, target?: THREE.Object3D) => {
    if (!target) return;

    const dice = dices[i];

    if (status === "rolling" || !dice.picked) {
      target.position.copy(dice.position as any);
      target.setRotationFromQuaternion(dice.quaternion as any);

      //
    } else if (status === "picking" || status === "pre-roll") {
      cameraTransform.pointToWorld(dice.inHand.position, inHand);
      cameraTransform.pointToWorld(dice.edge.position, pushEdge);

      E.copy(inHand);
      E.lerp(dice.position, 1 - pullSpring.x, E);
      E.lerp(pushEdge, pushSpring.x, E);

      target.position.copy(E as any);

      const Eq = new CANNON.Quaternion();
      Eq.copy(dice.inHand.quaternion);
      Eq.slerp(dice.quaternion, 1 - pullSpring.x, Eq);
      Eq.slerp(dice.edge.quaternion, pushSpring.x, Eq);

      target.setRotationFromQuaternion(Eq as any);
      //
    }
  };

  const updateCamera = (camera: THREE.Camera) => {
    cameraTransform.quaternion.copy(camera.quaternion as any);
    cameraTransform.position.copy(camera.position as any);
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
