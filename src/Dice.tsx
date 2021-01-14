import * as React from "react";

export const Dice = (props: any) => (
  <mesh {...props}>
    <boxBufferGeometry args={[1, 1, 1]} />
    <meshPhysicalMaterial color={0x3453ff} metalness={0} roughness={0} />
  </mesh>
);
