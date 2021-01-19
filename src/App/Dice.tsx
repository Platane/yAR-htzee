import { useGLTF } from "drei";
import * as React from "react";

const diceUrl = "assets/dice.glb";

useGLTF.preload(diceUrl);

export const Dice = (props: any) => {
  const { nodes, materials } = useGLTF(diceUrl);

  return (
    <mesh
      castShadow
      {...props}
      material={materials.Dice}
      geometry={(nodes.mesh_0 as any).geometry}
      dispose={null}
    />
  );
};
