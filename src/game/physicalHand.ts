import * as CANNON from "cannon-es";
import { nDice } from "./types";

const stepDuration = 2 / 60;

/**
 * generate hand position
 * aka dices pulled together but not overlapping
 */
export const getPhysicalHand = (startingPoses: CANNON.Transform[]) => {
  // prepare
  bodies.forEach((body, i) => {
    world.removeBody(body);

    const pose = startingPoses[i];

    if (pose) {
      body.velocity.setZero();
      body.angularVelocity.setZero();
      body.position.copy(pose.position);
      body.quaternion.copy(pose.quaternion);

      world.addBody(body);
    }
  });

  let stable = false;
  while (!stable) {
    // step
    for (let k = 10; k--; ) {
      bodies.forEach(({ spring }) => spring.applyForce());
      world.step(5 / 60);
    }

    // check if stable
    stable = bodies.every(
      (body) =>
        body.velocity.lengthSquared() < 0.1 &&
        body.angularVelocity.lengthSquared() < 0.05
    );
  }

  return startingPoses.map((_, i) => {
    const body = bodies[i];

    const inHand = new CANNON.Transform({
      position: body.position.clone(),
      quaternion: body.quaternion.clone(),
    });

    const position = new CANNON.Vec3(
      body.position.x * 2,
      body.position.y * 1.8,
      body.position.z * 1.2 - 2.2
    );

    const quaternion = new CANNON.Quaternion(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();

    const edge = new CANNON.Transform({ position, quaternion });

    return { inHand, edge };
  });
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
