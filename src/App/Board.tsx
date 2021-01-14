import * as React from "react";
import * as THREE from "three";
import { useFrame } from "react-three-fiber";
import { Dice } from "../Dice";

type Props = { placed: boolean; onPlace: () => void };

export const Board = ({ placed, onPlace }: Props) => {
  const positionContainerRef = React.useRef<any>();
  const transformContainerRef = React.useRef<any>();

  const placedRef = React.useRef(placed);
  placedRef.current = placed;

  useFrame(({ camera }) => {
    if (placedRef.current) return;

    const p = getGroundPoint(camera as any);

    positionContainerRef.current.position.copy(p);
  });

  return (
    <>
      <group ref={positionContainerRef}>
        <group ref={transformContainerRef}>
          <Circle onClick={onPlace} placed={placed} />

          <Cube />

          <Dice />
        </group>
      </group>
    </>
  );
};

const getGroundPoint = (
  camera: THREE.PerspectiveCamera,
  coord = { x: 0, y: 0 }
) => {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(coord, camera);
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  return raycaster.ray.intersectPlane(ground, new THREE.Vector3());
};

const Cube = () => (
  <mesh position={[0, 0.15, 0]} scale={[0.3, 0.3, 0.3]}>
    <boxBufferGeometry args={[1, 1, 1]} />
    <meshPhysicalMaterial color={0x3453ff} metalness={0} roughness={0} />
  </mesh>
);

const Circle = ({ placed, ...props }: any) => (
  <mesh {...props} rotation={[-Math.PI / 2, 0, 0]}>
    <circleBufferGeometry args={[1, 32]} />
    <meshPhysicalMaterial
      color={"orange"}
      opacity={placed ? 0.5 : 0.2}
      metalness={0}
      roughness={0}
      transparent
    />
  </mesh>
);
