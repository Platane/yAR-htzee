import * as React from "react";
import {
  Category,
  DiceRoll,
  ScoreSheet as IScoreSheet,
} from "../../../game/types";
import { isFinished } from "../../useGame";
import { ScoreSheetContent } from "./ScoreSheetContent";

type Props = {
  scoreSheet: IScoreSheet;
  rollCandidate?: DiceRoll | null;

  onSelectCategory?: (category: Category) => void;
  onClose?: () => void;
  reset?: () => void;

  style?: any;
};

export const ScoreSheet = ({
  scoreSheet,
  rollCandidate,
  onClose,
  reset,
  onSelectCategory,
  style,
}: Props) => (
  <div
    style={{
      position: "relative",
      padding: "10px",
      background: "#fff",
      borderRadius: "2px",
      boxShadow: "5px 8px 16px 0 rgba(0,0,0,0.2)",
      margin: "60px auto",
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        marginBottom: "10px",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h3 style={{ paddingLeft: "10px" }}>Score Sheet</h3>

      <button
        style={{ marginLeft: "auto", alignSelf: "flex-start" }}
        onClick={onClose}
      >
        ×
      </button>
    </div>

    <ScoreSheetContent
      scoreSheet={scoreSheet}
      rollCandidate={rollCandidate}
      onSelectCategory={onSelectCategory}
    />

    <div
      style={{
        display: "flex",
        marginBottom: "10px",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <button
        style={{
          marginTop: "20px",
          marginLeft: "auto",
          height: "40px",
          padding: "0 10px",
        }}
        onClick={() => {
          if (
            isFinished(scoreSheet) ||
            window.confirm("Erase your score sheet and start over ?")
          )
            reset?.();
        }}
      >
        restart a new game
      </button>
    </div>
  </div>
);
