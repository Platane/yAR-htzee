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

export type Category = typeof categories[number];

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export type DiceRoll = [DiceValue, DiceValue, DiceValue, DiceValue, DiceValue];

export type ScoreSheet = Record<Category, DiceRoll | null>;

export const nDice = 5;
