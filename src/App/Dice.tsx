import { useGLTF } from "drei";
import * as React from "react";
import * as THREE from "three";

const diceUrl = "assets/dice.glb";

useGLTF.preload(diceUrl);

const scale = new THREE.Vector3(0.5, 0.5, 0.5);

/**
 * 1x1x1 dice
 */
export const Dice = (props: any) => {
  const { nodes, materials } = useGLTF(diceUrl);

  return (
    <group {...props}>
      <mesh
        castShadow
        material={materials.Dice}
        geometry={(nodes.mesh_0 as any).geometry}
        scale={scale}
        dispose={null}
      />
    </group>
  );
};
