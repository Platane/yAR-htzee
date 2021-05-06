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
  const { nodes, materials } = useGLTF(diceUrl);

  const mat = materials.Dice as THREE.MeshStandardMaterial;

  return (
    <mesh
      {...props}
      castShadow
      geometry={(nodes.mesh_0 as any).geometry}
      scale={scale}
      dispose={null}
    >
      <meshStandardMaterial {...mat} color={selected ? "hotpink" : mat.color} />
    </mesh>
  );
};
