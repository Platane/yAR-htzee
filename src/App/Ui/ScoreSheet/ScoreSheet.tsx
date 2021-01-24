import * as React from "react";
import {
  Category,
  DiceRoll,
  ScoreSheet as IScoreSheet,
} from "../../../game/types";
import { ScoreSheetContent } from "./ScoreSheetContent";

type Props = {
  scoreSheet: IScoreSheet;
  rollCandidate?: DiceRoll | null;

  onSelectCategory?: (category: Category) => void;
  onClose?: () => void;

  style?: any;
};

export const ScoreSheet = ({
  scoreSheet,
  rollCandidate,
  onClose,
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
  </div>
);
