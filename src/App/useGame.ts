import { categories, Category, DiceRoll, ScoreSheet } from "../game/types";
import create from "zustand";
import { nDice } from "../game/physicalWorld";

const emptyScoreSheet = Object.fromEntries(
  categories.map((category) => [category, null])
) as ScoreSheet;

const fullReroll = Array.from({ length: nDice }, (_, i) => i);

export type Api = {
  openScoreSheet: () => void;
  closeScoreSheet: () => void;
  selectCategoryForRoll: (category: Category) => void;
  toggleDiceReroll: (i: number) => void;
  onRollStatusChanged: (
    status: "pre-roll" | "rolling" | "picking",
    roll?: DiceRoll
  ) => void;
};
export type State = {
  roundKey: number;
  scoreSheetOpened: boolean;
  scoreSheet: ScoreSheet;
  roll: DiceRoll | null;
  status: "pre-roll" | "rolling" | "picking";
  dicesToReroll: number[];
  k: number;
};

export const useStore = create<State & Api>((set) => ({
  roundKey: 1,
  scoreSheetOpened: false,
  scoreSheet: { ...emptyScoreSheet },
  status: "pre-roll",
  roll: null,
  k: 0,
  dicesToReroll: [...fullReroll],

  openScoreSheet: () => set({ scoreSheetOpened: true }),
  closeScoreSheet: () => set({ scoreSheetOpened: false }),

  reset: () =>
    set((state) => ({
      roundKey: state.roundKey + 1,
      roll: null,
      dicesToReroll: [...fullReroll],
      scoreSheetOpened: false,
      scoreSheet: { ...emptyScoreSheet },
      k: 0,
      status: "pre-roll",
    })),

  toggleDiceReroll: (i) =>
    set((state) => {
      if (state.status !== "picking" || state.k >= 3) return {};

      return {
        dicesToReroll: state.dicesToReroll.includes(i)
          ? state.dicesToReroll.filter((u) => u !== i)
          : [...state.dicesToReroll, i],
      };
    }),

  onRollStatusChanged: (status, roll) =>
    set(({ k }) => {
      if (status === "rolling") return { status, k: k + 1 };

      if (status === "picking") return { status, roll, dicesToReroll: [] };

      return { status };
    }),

  selectCategoryForRoll: (category) =>
    set((state) => {
      if (state.status !== "picking") return {};

      if (!state.roll) return {};

      if (state.scoreSheet[category]) return {};

      return {
        roundKey: state.roundKey + 1,
        roll: null,
        dicesToReroll: [...fullReroll],
        scoreSheetOpened: false,
        scoreSheet: {
          ...state.scoreSheet,
          [category]: state.roll,
        },
        k: 0,
        status: "pre-roll",
      };
    }),
}));
