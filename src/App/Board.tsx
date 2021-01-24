import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "react-three-fiber";
import { Dice } from "./Dice";
import { createWorld, nDice } from "../game/physicalWorld";

type Props = { placed: boolean; onPlace: () => void };

export const Board = ({}: Props) => {
  const dicesRef = React.useRef<THREE.Object3D>();

  const [world] = React.useState(createWorld);

  useFrame(({ camera }, dt) => {
    world.updateCamera(camera);

    const clampDt = Math.min((1 / 60) * 5, dt);

    world.step(clampDt);

    for (let i = nDice; i--; ) {
      const object = dicesRef.current?.children?.[i];
      if (object) world.copy(i, object);
    }
  });

  const [picked, setPicked] = React.useState<number[]>([]);
  const toggle = (i: number) => () =>
    setPicked((p) => (p.includes(i) ? p.filter((u) => u !== i) : [...p, i]));

  // attach event handler
  const {
    gl: { domElement },
  } = useThree();
  React.useEffect(() => {
    let anchor: { x: number; y: number } | null = null;
    const onDown = ({ x, y }: PointerEvent) => {
      anchor = { x, y };
    };
    const onMove = ({ x, y }: PointerEvent) => {
      if (!anchor) return;

      const dy = (y - anchor.y) / domElement.clientHeight;

      world.setPullX(dy);
    };
    const onUp = ({ x, y }: PointerEvent) => {
      anchor = null;
      world.release();
    };

    domElement.addEventListener("pointerdown", onDown);
    domElement.addEventListener("pointermove", onMove);
    domElement.addEventListener("pointerup", onUp);

    return () => {
      domElement.removeEventListener("pointerdown", onDown);
      domElement.removeEventListener("pointermove", onMove);
      domElement.removeEventListener("pointerup", onUp);
    };
  }, [domElement]);

  return (
    <>
      <Ground />

      <group ref={dicesRef}>
        {Array.from({ length: nDice }).map((_, i) => (
          <Dice
            key={i}
            onClick={toggle(i)}
            scale={picked.includes(i) ? [1.2, 1.2, 1.2] : [1, 1, 1]}
          />
        ))}
      </group>
    </>
  );
};

const getGroundPoint = (camera: THREE.Camera, coord = { x: 0, y: 0 }) => {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(coord, camera);
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  return raycaster.ray.intersectPlane(ground, new THREE.Vector3());
};

const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
    <planeBufferGeometry args={[100, 100]} />
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
