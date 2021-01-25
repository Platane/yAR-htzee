import * as React from "react";
import { Dice } from "./Dice";
import { Hand } from "./Hints/Hand";

type Props = { onClose: () => void; loading: boolean };

export const PageRules = ({ onClose, loading }: Props) => (
  <div
    style={{
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      zIndex: 2,
    }}
  >
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

    <Hand />

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

    <h2>About</h2>

    <p>
      Made by <a href="https://github.com/Platane">platane</a>
    </p>

    <p>
      <a href="https://skfb.ly/6RtsC">Dice model</a> by tnRaro, licensed under{" "}
      <a href="http://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      <br />
      <a href="https://hdrihaven.com/hdri/?c=indoor&h=lebombo">Hdri map</a> by
      Greg Zaal, licensed under{" "}
      <a href="https://creativecommons.org/share-your-work/public-domain/cc0/">
        CC0
      </a>
      .
    </p>

    <button
      style={{
        width: "160px",
        height: "40px",
        marginTop: "60px",
        alignSelf: "center",
      }}
      onClick={loading ? undefined : onClose}
      disabled={loading}
    >
      {loading && "loading..."}
      {!loading && "Start"}
    </button>
  </div>
);
