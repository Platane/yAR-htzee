import * as CANNON from "cannon-es";
import { stepSpring } from "./spring";
import { createNanoEvents, Emitter } from "nanoevents";
import * as THREE from "three";
import { MathUtils } from "three";
import { nDice } from "./types";

const stepDuration = 2 / 60;

/**
 * generate hand position
 * aka dices pulled together but not overlapping
 */
export const getPhysicalHand = (startingPoses: CANNON.Transform[]) => {
  startingPoses.forEach((pose, i) => {
    const body = bodies[i];

    body.velocity.setZero();
    body.angularVelocity.setZero();
    body.position.copy(pose.position);
    body.quaternion.copy(pose.quaternion);

    world.addBody(body);
  });

  let stable = false;
  while (!stable) {
    startingPoses.forEach((_, i) => bodies[i].spring.applyForce());

    world.step(stepDuration, stepDuration * 10, 10);

    stable = !startingPoses.some(
      (_, i) =>
        bodies[i].velocity.lengthSquared() > 0.1 ||
        bodies[i].angularVelocity.lengthSquared() > 0.01
    );
  }

  const inHand = startingPoses.map(
    (_, i) =>
      new CANNON.Transform({
        position: bodies[i].position.clone(),
        quaternion: bodies[i].quaternion.clone(),
      })
  );

  // clean up
  startingPoses.forEach((_, i) => {
    const body = bodies[i];
    world.removeBody(body);
  });

  return { inHand };
};

const world = new CANNON.World();
world.broadphase = new CANNON.NaiveBroadphase();
world.gravity.set(0, 0, 0);

const planeShape = new CANNON.Plane();
const ground = new CANNON.Body({
  mass: 0,
  type: CANNON.BODY_TYPES.STATIC,
});
ground.addShape(
  planeShape,
  new CANNON.Vec3(0, -10, 0),
  new CANNON.Quaternion().setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
  )
);
world.addBody(ground);

const size = new CANNON.Vec3(0.5, 0.5, 0.5);
const shape = new CANNON.Box(size);
const bodies = Array.from({ length: nDice }, () => {
  const body = new CANNON.Body({ mass: 1 });

  body.addShape(shape);

  const spring = new CANNON.Spring(body, ground);

  return Object.assign(body, { spring });
});
