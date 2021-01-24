import * as React from "react";
import { getScore } from "../../../game/getScore";
import {
  categories,
  Category,
  DiceRoll,
  ScoreSheet,
} from "../../../game/types";
import { Dice } from "../Dice";

type Props = {
  scoreSheet: ScoreSheet;
  rollCandidate?: DiceRoll | null;

  onOpenTooltip?: (label: string) => void;
  onSelectCategory?: (category: Category) => void;

  style?: any;
};

export const ScoreSheetContent = ({
  scoreSheet,
  rollCandidate,
  onOpenTooltip,
  onSelectCategory,
  style,
}: Props) => (
  <table
    style={{
      borderCollapse: "collapse",
      borderSpacing: "0",
      width: "100%",
      ...style,
    }}
  >
    <tbody
      style={{
        verticalAlign: "middle",
        display: "table-row-group",
      }}
    >
      <tr style={{ border: "1px solid #ddd", height: "36px" }}>
        <th>Combination</th>
        <th>Score</th>
      </tr>
      {categories.slice(0, 6).map((category) => (
        <Line
          key={category}
          category={category}
          roll={scoreSheet[category]}
          rollCandidate={rollCandidate ?? null}
          onOpenTooltip={onOpenTooltip}
          onSelect={onSelectCategory && (() => onSelectCategory(category))}
        />
      ))}

      <tr style={{ height: "30px" }} />

      {categories.slice(6).map((category) => (
        <Line
          key={category}
          category={category}
          roll={scoreSheet[category]}
          rollCandidate={rollCandidate ?? null}
          onOpenTooltip={onOpenTooltip}
          onSelect={onSelectCategory && (() => onSelectCategory(category))}
        />
      ))}

      <tr style={{ height: "30px" }} />
      <tr>
        <td />
        <Td style={{ border: "1px solid #ddd" }}>
          <div style={{ marginLeft: "auto" }}>
            {categories.reduce((s, c) => {
              const roll = scoreSheet[c];

              return s + (roll ? getScore(c, roll) : 0);
            }, 0)}
          </div>
        </Td>
      </tr>
    </tbody>
  </table>
);

type LineProps = {
  category: Category;
  roll: DiceRoll | null;
  rollCandidate: DiceRoll | null;
  onOpenTooltip?: (label: string) => void;
  onSelect?: () => void;
};
const Line = ({
  category,
  roll,
  rollCandidate,
  onSelect,
  onOpenTooltip,
}: LineProps) => {
  const i = categories.indexOf(category);

  return (
    <tr style={{ border: "1px solid #ddd" }}>
      <Td>
        {i < 6 && (
          <Dice
            style={{ width: "20px", height: "20px", margin: "0 4px" }}
            value={(i + 1) as any}
          />
        )}
        <span>{category}</span>

        {onOpenTooltip && (
          <button
            style={{ margin: "0 8px", marginLeft: "auto" }}
            onClick={() => onOpenTooltip(category)}
          >
            ?
          </button>
        )}
      </Td>
      <Td>
        {roll && (
          <>
            {roll.map((x, i) => (
              <Dice
                key={i}
                value={x}
                style={{ width: "14px", height: "14px" }}
              />
            ))}
            <div style={{ marginLeft: "auto" }}>{getScore(category, roll)}</div>
          </>
        )}
        {!roll && rollCandidate && onSelect && (
          <button
            style={{ marginLeft: "auto", minWidth: "90px" }}
            onClick={onSelect}
          >
            {`select for ${getScore(category, rollCandidate)}`}
          </button>
        )}
      </Td>
    </tr>
  );
};

const Td = ({ children, style }: any) => (
  <td
    style={{
      height: "36px",
      padding: "0 8px",
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "stretch",
      }}
    >
      {children}
    </div>
  </td>
);
