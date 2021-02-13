/**
 * step the spring, mutate the state to reflect the state at t+dt
 *
 */
const stepSpringOne = (
  s: { x: number; v: number; target: number },
  { tension, friction }: { tension: number; friction: number },

  dt = 1 / 60
) => {
  const a = -tension * (s.x - s.target) - friction * s.v;

  s.v += a * dt;
  s.x += s.v * dt;
};

export const stepSpring = (
  s: { x: number; v: number; target: number },
  params: { tension: number; friction: number },
  dt = 1 / 60
) => {
  const interval = 1 / 60;

  while (dt > 0) {
    stepSpringOne(s, params, Math.min(interval, dt));
    dt -= interval;
  }
};
