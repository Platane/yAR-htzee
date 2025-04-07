import * as React from "react";
import { Dice } from "./Dice";
import type { DiceValue } from "../../gameRules/types";

type Props = {
  remainingRerolls: number;
  diceRoll: (DiceValue | "rolling" | "blank")[];
  onToggleDicePicked?: (diceIndex: number) => void;
};

export const Header = ({
  diceRoll,
  remainingRerolls,
  onToggleDicePicked,
}: Props) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      zIndex: 1,
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: "10px",
      pointerEvents: "none",
    }}
  >
    <style>{`
          @keyframes dice_value_pulse {
            100%,0% { transform: scale(1,1) }
            20% { transform: scale(1.15,1.15) }
          }
        `}</style>

    {diceRoll.map((x, i) => (
      <Dice
        key={i}
        value={x}
        style={{
          pointerEvents: onToggleDicePicked ? "auto" : "none",
          animation:
            typeof x === "number" ? "dice_value_pulse 500ms" : undefined,
        }}
        onClick={onToggleDicePicked && (() => onToggleDicePicked(i))}
      />
    ))}

    <span
      style={{
        marginLeft: "10px",
        fontSize: "1.2em",
        fontWeight: 800,
        color: "#fff",
        textShadow:
          "1px 0px 0.5px #0008, -1px 0px 0.5px #0008, 0px -1px 0.5px #0008, 0px 1px 0.5px #0008",
        pointerEvents: "none",
      }}
    >
      {`${remainingRerolls} re-roll left`}
    </span>
  </div>
);
