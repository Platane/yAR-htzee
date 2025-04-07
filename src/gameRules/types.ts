export const categories = [
  "Aces",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",

  "Three Of A Kind",
  "Four Of A Kind",
  "Full House",
  "Small Straight",
  "Large Straight",
  "Yahtzee",
  "Chance",
] as const;

export type Category = (typeof categories)[number];

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export type ScoreSheet = Record<Category, DiceValue[] | null>;

export const isDiceValue = (d: any): d is DiceValue =>
  d === 1 || d === 2 || d === 3 || d === 4 || d === 5 || d === 6;

export const createEmptyScoreSheet = () =>
  Object.fromEntries(
    categories.map((category) => [category, null])
  ) as ScoreSheet;

export const isScoreSheetFinished = (scoreSheet: ScoreSheet) =>
  categories.every((c) => scoreSheet[c]);

export const isScoreSheetEmpty = (scoreSheet: ScoreSheet) =>
  !categories.some((c) => scoreSheet[c]);
