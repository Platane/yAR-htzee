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
      padding: "10px",
    }}
  >
    {roll?.map((x: any, i: number) => (
      <Dice
        key={i}
        value={x}
        onClick={status === "picking" ? () => toggleDiceReroll(i) : undefined}
      />
    ))}
  </div>
);
