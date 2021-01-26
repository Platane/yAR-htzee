import * as React from "react";
import { State, Api } from "../useGame";
import { Dice } from "./Dice";

type Props = Pick<State & Api, "k" | "status" | "roll" | "toggleDiceReroll">;

export const Header = ({ k, status, roll, toggleDiceReroll }: Props) => (
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
    {roll?.map((x: any, i: number) => (
      <Dice
        key={i}
        value={x}
        style={{ pointerEvents: status === "picking" ? "auto" : "none" }}
        onClick={() => toggleDiceReroll(i)}
      />
    ))}

    {roll && (
      <span
        style={{
          marginLeft: "10px",
          fontSize: "1.2em",
          color: "#fff",
          textShadow: "1px 1px 4px black, -1px -1px 4px black",
          pointerEvents: "none",
        }}
      >
        {`${Math.max(0, 3 - k)} re-roll left`}
      </span>
    )}
  </div>
);
