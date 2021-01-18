import * as React from "react";
import * as THREE from "three";
import { useFrame } from "react-three-fiber";
import { Game } from "./Game";

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

          <Ground />

          <Game />
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

const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
    <planeBufferGeometry args={[10, 10]} />
    <shadowMaterial opacity={0.4} />
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
