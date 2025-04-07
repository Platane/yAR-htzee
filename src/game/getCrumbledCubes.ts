import * as CANNON from "cannon-es";
import type { Transform } from "./state";

export const getCrumbledCubes = ({ n }: { n: number }): Transform[] => {
  const world = new CANNON.World();
  world.broadphase = new CANNON.NaiveBroadphase();
  world.gravity.set(0, 0, 0);

  const sphereBody = new CANNON.Body({
    mass: 0,
    type: CANNON.BODY_TYPES.STATIC,
  });
  world.addBody(sphereBody);

  const size = new CANNON.Vec3(0.5, 0.5, 0.5);
  const shape = new CANNON.Box(size);
  const bodies = Array.from({ length: n }, () => {
    const body = new CANNON.Body({ mass: 1 });
    body.addShape(shape);
    world.addBody(body);

    const spring = new CANNON.Spring(body, sphereBody);

    return Object.assign(body, { spring });
  });

  // position the body randomly in a way they don't collide
  const offset = Math.floor(Math.random() * n);
  const s = Math.ceil(Math.sqrt(n));
  for (let i = n; i--; ) {
    const x = Math.floor(i / s);
    const y = i % s;

    const body = bodies[(i + offset) % n];
    body.position.set(x * 1.5, y * 1.5, (Math.random() - 0.5) * s);

    body.quaternion.set(Math.random(), Math.random(), Math.random(), 1);
    body.quaternion.normalize();
  }

  let stable = false;
  while (!stable) {
    // step
    for (let k = 10; k--; ) {
      bodies.forEach(({ spring }) => spring.applyForce());
      world.step((5 * 1) / 60);
    }

    // check if stable
    stable = world.bodies.every(
      (body) =>
        body.velocity.lengthSquared() < 0.1 &&
        body.angularVelocity.lengthSquared() < 0.08
    );
  }

  for (let k = 10; k--; ) {
    bodies.forEach(({ spring }) => spring.applyForce());
    world.step((2 * 1) / 60);
  }

  return bodies;
};
