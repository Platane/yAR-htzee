import * as React from "react";
import { useShadowResize } from "./useShadowResize";

export const Ground = () => {
  useShadowResize();

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.001, 0]}
      receiveShadow
    >
      <planeBufferGeometry args={[100, 100]} />
      <shadowMaterial opacity={0.4} />
    </mesh>
  );
};
