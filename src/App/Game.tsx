import * as React from "react";
import { Dice } from "./Dice";

type Props = {};

export const Game = ({}: Props) => {
  return (
    <>
      <Dice position={[0, 0.2, 0]} />
    </>
  );
};
