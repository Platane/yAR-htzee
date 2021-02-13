import * as React from "react";
import { Dice } from "./Dice";

export const PageRules = () => (
  <>
    <h1 style={{ alignSelf: "center" }}>yAR-htzee</h1>

    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignSelf: "center",
        padding: "10px",
      }}
    >
      <Dice value={1} />
      <Dice value={2} />
      <Dice value={3} />
      <Dice value={4} />
      <Dice style={{ marginLeft: "10px" }} value={6} />
    </div>

    <p>
      <i>
        A pretty cool{" "}
        <a href="https://en.wikipedia.org/wiki/Yahtzee">yahtzee</a> game in
        augmented reality.
      </i>
    </p>

    <h2>Rules</h2>

    <p>This game is about making combination with 5 dices.</p>

    <p>
      You get to roll the dices, and re-roll any number of dice you want two
      times.
    </p>

    <p>
      Then pick one of the combinations, some awards more points than others.
    </p>

    <p>
      There is 13 rounds, after which you should have filled your score sheet
      with every of the 13 combinations.
    </p>

    <p>Sum all combinations points and replay to beat your score!</p>
  </>
);
