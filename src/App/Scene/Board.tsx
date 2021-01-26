import * as React from "react";
import * as THREE from "three";
import { Dice } from "./Dice";
import { nDice } from "../../game/physicalWorld";
import { useWorld } from "./useWorld";
import { SelectedDiceHint } from "./SelectedDiceHint";
import { ScaleOnPulse } from "./ScaleOnPulse";
import { useDelay } from "../Ui/useDelay";

type Props = {
  status: any;
  roundKey?: number;
  dicesToReroll: number[];
  onStatusChanged?: (status: any, x?: any) => void;
  toggleDiceReroll?: (i: number) => void;
};

const dicesIndexes = Array.from({ length: nDice }, (_, i) => i);

export const Board = ({
  status,
  roundKey,
  onStatusChanged,
  toggleDiceReroll,
  dicesToReroll,
}: Props) => {
  const dicesRef = React.useRef<THREE.Object3D>();
  const hintsRef = React.useRef<THREE.Object3D>();

  const [dragging, setDragging] = React.useState(false);

  const world = useWorld(dicesRef, hintsRef, setDragging);

  React.useEffect(() => {
    if (!onStatusChanged) return;
    return world.on("status-changed", onStatusChanged);
  }, [world, onStatusChanged]);

  React.useEffect(() => {
    world.setPickedDice(dicesToReroll ?? []);
  }, [world, dicesToReroll]);

  React.useEffect(world.reset, [roundKey]);

  const pickingPulse =
    useDelay(status === "picking", 500) === null && status === "picking";

  return (
    <>
      <group ref={dicesRef}>
        {dicesIndexes.map((i) => (
          <ScaleOnPulse
            key={i}
            pulse={
              (status === "picking" &&
                !dragging &&
                dicesToReroll.includes(i) &&
                "selected") ||
              (pickingPulse && "pop")
            }
          >
            <Dice
              onClick={
                toggleDiceReroll &&
                ((event: Event) => {
                  event.stopPropagation();
                  toggleDiceReroll(i);
                })
              }
            />
          </ScaleOnPulse>
        ))}
      </group>

      <group ref={hintsRef}>
        {dicesIndexes.map((i) => (
          <SelectedDiceHint
            key={i}
            selected={
              status === "picking" && !dragging && dicesToReroll.includes(i)
            }
          />
        ))}
      </group>
    </>
  );
};
