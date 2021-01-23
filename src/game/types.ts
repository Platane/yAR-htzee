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
