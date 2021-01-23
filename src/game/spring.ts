/**
 * step the spring, mutate the state to reflect the state at t+dt
 *
 */
const stepSpringOne = (
  s: { x: number; v: number },
  { tension, friction }: { tension: number; friction: number },
  target: number,
  dt = 1 / 60
) => {
  const a = -tension * (s.x - target) - friction * s.v;

  s.v += a * dt;
  s.x += s.v * dt;
};

export const stepSpring = (
  s: { x: number; v: number },
  params: { tension: number; friction: number },
  target: number,
  dt = 1 / 60
) => {
  const interval = 1 / 60;

  while (dt > 0) {
    stepSpringOne(s, params, target, Math.min(interval, dt));
    // eslint-disable-next-line no-param-reassign
    dt -= interval;
  }
};
