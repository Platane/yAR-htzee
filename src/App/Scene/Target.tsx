import * as React from "react";
import * as THREE from "three";
import { useFrame } from "react-three-fiber";
import { MathUtils } from "three";

export const Target = () => {
  const ref = React.useRef<THREE.Object3D>();

  useFrame(({ camera }) => {
    // raycast to ground
    p.set(0, 0, 0);
    raycaster.setFromCamera(coord, camera);
    raycaster.ray.intersectPlane(ground, p);

    // camera position + dice end roll estimation
    p.copy(camera.position);
    p.y = -0.01;
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    p.addScaledVector(
      direction,
      6 + MathUtils.clamp(camera.position.y, 1, 4) * 1.2
    );

    ref.current?.position.copy(p);
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <circleBufferGeometry args={[2, 32]} />
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
const coord = { x: 0, y: 0 };
const p = new THREE.Vector3();
const direction = new THREE.Vector3();
