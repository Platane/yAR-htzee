import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "react-three-fiber";
import { createWorld, nDice } from "../../game/physicalWorld";

export const useWorld = (
  dicesRef: React.MutableRefObject<THREE.Object3D | undefined>
) => {
  // instantiate the world
  const [world] = React.useState(createWorld);

  // on each frame, step the world
  // and copy the position of the dice to the rendering scene
  useFrame(({ camera }, dt) => {
    world.updateCamera(camera);

    world.step(dt);

    for (let i = nDice; i--; ) {
      const object = dicesRef.current?.children?.[i];
      if (object) world.copy(i, object);
    }
  });

  // attach event handlers
  const {
    gl: { domElement },
  } = useThree();
  React.useEffect(() => {
    let anchor: { y: number } | null = null;
    const onDown = ({ y }: PointerEvent) => {
      anchor = { y };
    };
    const onMove = ({ y }: PointerEvent) => {
      if (!anchor) return;

      const dy = (y - anchor.y) / domElement.clientHeight;

      world.setPullX(dy);
    };
    const onUp = (_p: PointerEvent) => {
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

  return world;
};
