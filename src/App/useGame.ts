import {
  categories,
  Category,
  DiceRoll,
  nDice,
  ScoreSheet,
} from "../game/types";
import create from "zustand";

const emptyScoreSheet = Object.fromEntries(
  categories.map((category) => [category, null])
) as ScoreSheet;

export const isFinished = (scoreSheet: ScoreSheet) =>
  categories.every((c) => scoreSheet[c]);

const fullReroll = Array.from({ length: nDice }, (_, i) => i);

export type Api = {
  reset: () => void;
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
      if (
        state.status !== "picking" ||
        state.k >= 3 ||
        isFinished(state.scoreSheet)
      )
        return state;

      return {
        dicesToReroll: state.dicesToReroll.includes(i)
          ? state.dicesToReroll.filter((u) => u !== i)
          : [...state.dicesToReroll, i],
      };
    }),

  onRollStatusChanged: (status, roll) =>
    set((state) => {
      if (status === "rolling") return { ...state, status, k: state.k + 1 };

      if (status === "picking")
        return { ...state, status, roll: roll ?? null, dicesToReroll: [] };

      return { ...state, status };
    }),

  selectCategoryForRoll: (category) =>
    set((state) => {
      if (state.status !== "picking") return state;

      if (!state.roll) return state;

      if (state.scoreSheet[category]) return state;

      const scoreSheet = {
        ...state.scoreSheet,
        [category]: state.roll,
      };

      if (isFinished(scoreSheet))
        return {
          ...state,
          scoreSheet,
          status: "picking",
          scoreSheetOpened: true,
        };

      return {
        roundKey: state.roundKey + 1,
        roll: null,
        dicesToReroll: [...fullReroll],
        scoreSheetOpened: false,
        scoreSheet,
        k: 0,
        status: "pre-roll",
      };
    }),
}));
