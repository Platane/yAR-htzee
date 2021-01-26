import * as React from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";
import { stepSpring } from "../../game/spring";

const springParams = { tension: 120, friction: 8 };

export const SelectedDiceHint = ({ selected }: any) => {
  const spring = React.useRef({ x: 0, v: 0, target: 0 });
  spring.current.target = selected ? 1 : 0;

  useFrame(({ camera }, dt) => {
    stepSpring(spring.current, springParams, spring.current.target, dt);

    const [tube, panel] = ref.current?.children ?? [];

    if (!tube || !panel) return;

    const { x } = spring.current;

    const kTube = Math.min(0.5, x) / 0.5;
    const kPanel = Math.max(0, (x - 0.5) / 0.5);

    tube.position.y = kTube * 0.5;
    tube.scale.setScalar(Math.max(0.001, kTube));
    panel.scale.setScalar(Math.max(0.001, kPanel));

    panel.lookAt(camera.position);
  });

  const ref = React.useRef<THREE.Object3D>();

  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, 0]} position={[0, 0.5, 0]}>
        <cylinderBufferGeometry args={[0.04, 0.04, 1.6, 5]} />
        <meshBasicMaterial color={"orange"} />
      </mesh>
      <mesh rotation={[0, 0, 0]} position={[0, 1.4, 0]}>
        <circleBufferGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={"orange"} />
      </mesh>
    </group>
  );
};
