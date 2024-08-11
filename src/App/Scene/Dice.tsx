import { useGLTF } from "@react-three/drei";
import * as React from "react";
import * as THREE from "three";

const diceUrl = "assets/dice.glb";

useGLTF.preload(diceUrl);

const scale = new THREE.Vector3(0.5, 0.5, 0.5);

type Props = {
  selected?: boolean;
  onClick?: any;
} & any;

/**
 * 1x1x1 dice
 */
export const Dice = ({ selected, ...props }: Props) => {
  const { nodes } = useGLTF(diceUrl);

  const mesh = nodes.mesh_0 as THREE.Mesh;

  return (
    <mesh
      {...props}
      castShadow
      geometry={mesh.geometry}
      material={mesh.material}
      scale={scale}
      dispose={null}
    />
  );
};
