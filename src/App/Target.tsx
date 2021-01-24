import * as React from "react";
import * as THREE from "three";
import { useFrame } from "react-three-fiber";

export const Target = () => {
  const ref = React.useRef<THREE.Object3D>();

  useFrame(({ camera }) => {
    const p = getGroundPoint(camera);

    if (p) ref.current?.position.copy(p);
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <circleBufferGeometry args={[1, 32]} />
      <meshPhysicalMaterial
        color={"orange"}
        opacity={0.2}
        metalness={0}
        roughness={0}
        transparent
      />
    </mesh>
  );
};

const raycaster = new THREE.Raycaster();
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const defaultCoord = { x: 0, y: 0 };
const getGroundPoint = (camera: THREE.Camera, coord = defaultCoord) => {
  raycaster.setFromCamera(coord, camera);
  return raycaster.ray.intersectPlane(ground, new THREE.Vector3());
};
