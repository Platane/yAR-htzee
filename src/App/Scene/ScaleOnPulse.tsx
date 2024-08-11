import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stepSpring } from "../../game/spring";

type Props = {
  pulse?: boolean | number | string | null;
  children?: any;
};

export const ScaleOnPulse = ({ pulse, children }: Props) => {
  const ref = React.useRef<THREE.Group | null>(null);
  const spring = React.useRef({ x: 0, v: 0, target: 0 });
  React.useEffect(() => {
    if (pulse) spring.current.target = 1;
  }, [pulse]);

  useFrame((_, dt) => {
    stepSpring(spring.current, springParams, dt);

    if (spring.current.x > 1) spring.current.target = 0;

    const object = ref.current;
    if (object) {
      const s = 1 + spring.current.x * 0.16;

      object.scale.setScalar(Math.max(0.001, s));
      object.position.y = s - 1;
    }
  });

  return <group ref={ref}>{children}</group>;
};

const springParams = { tension: 190, friction: 12 };
