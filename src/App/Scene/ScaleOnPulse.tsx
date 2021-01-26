import * as React from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";
import { stepSpring } from "../../game/spring";

type Props = {
  pulse?: boolean | number | string | null;
  children?: any;
};

export const ScaleOnPulse = ({ pulse, children }: Props) => {
  const ref = React.useRef<THREE.Object3D>();
  const spring = React.useRef({ x: 0, v: 0, target: 0 });
  React.useEffect(() => {
    if (pulse) spring.current.target = 1;
  }, [pulse]);

  useFrame((_, dt) => {
    stepSpring(spring.current, springParams, spring.current.target, dt);

    if (spring.current.x > 1) spring.current.target = 0;
    ref.current?.scale.setScalar(Math.max(0.001, 1 + spring.current.x * 0.16));
  });

  return <group ref={ref}>{children}</group>;
};

const springParams = { tension: 190, friction: 12 };
