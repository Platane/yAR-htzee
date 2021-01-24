import * as React from "react";
import * as THREE from "three";
import { Dice } from "./Dice";
import { nDice } from "../../game/physicalWorld";
import { useWorld } from "./useWorld";

type Props = {
  roundKey?: number;
  dicesToReroll: number[];
  onStatusChanged?: (status: any, x?: any) => void;
  toggleDiceReroll?: (i: number) => void;
};

export const Board = ({
  roundKey,
  onStatusChanged,
  toggleDiceReroll,
  dicesToReroll,
}: Props) => {
  const dicesRef = React.useRef<THREE.Object3D>();

  const world = useWorld(dicesRef);

  React.useEffect(() => {
    if (!onStatusChanged) return;
    return world.on("status-changed", onStatusChanged);
  }, [world, onStatusChanged]);

  React.useEffect(() => {
    world.setPickedDice(dicesToReroll ?? []);
  }, [world, dicesToReroll]);

  React.useEffect(() => {
    debugger;
    world.reset();
  }, [roundKey]);

  return (
    <>
      <group ref={dicesRef}>
        {Array.from({ length: nDice }).map((_, i) => (
          <Dice
            key={i}
            onClick={
              toggleDiceReroll &&
              ((event: Event) => {
                event.stopPropagation();
                toggleDiceReroll(i);
              })
            }
            selected={dicesToReroll?.includes(i)}
          />
        ))}
      </group>
    </>
  );
};
