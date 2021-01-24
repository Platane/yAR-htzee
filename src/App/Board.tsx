import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "react-three-fiber";
import { Dice } from "./Dice";
import { createWorld, nDice } from "../game/physicalWorld";
import { Target } from "./Target";

type Props = {
  placed: boolean;
  onPlace: () => void;
  onStatusChanged?: (status: string) => void;
};

export const Board = ({ onStatusChanged }: Props) => {
  const dicesRef = React.useRef<THREE.Object3D>();

  const [world] = React.useState(createWorld);

  React.useEffect(() => {
    if (!onStatusChanged) return;
    return world.on("status-changed", onStatusChanged);
  }, [world, onStatusChanged]);

  useFrame(({ camera }, dt) => {
    world.updateCamera(camera);

    const clampDt = Math.min((1 / 60) * 5, dt);

    world.step(clampDt);

    for (let i = nDice; i--; ) {
      const object = dicesRef.current?.children?.[i];
      if (object) world.copy(i, object);
    }
  });

  const [picked, setPicked] = React.useState<number[] | null>([0, 1, 2, 3, 4]);
  React.useEffect(() => {
    return world.on("status-changed", (s) =>
      setPicked(s === "picking" ? [] : null)
    );
  }, [world, setPicked]);
  const toggle = (i: number) =>
    picked &&
    (() =>
      setPicked((p) => {
        if (!p) return p;
        if (p.includes(i)) return p.filter((u) => u !== i);
        else return [...p, i];
      }));

  React.useEffect(() => {
    world.setPickedDice(picked ?? []);
  }, [world, picked]);

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
          <Dice key={i} onClick={toggle(i)} selected={picked?.includes(i)} />
        ))}
      </group>
    </>
  );
};

const Ground = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
    <planeBufferGeometry args={[100, 100]} />
    <shadowMaterial opacity={0.4} />
  </mesh>
);
