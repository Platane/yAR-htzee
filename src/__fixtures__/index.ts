import { ScoreSheet } from "../game/types";

export const scoreSheet: ScoreSheet = {
  Aces: null,
  Two: [2, 3, 4, 1, 2],
  Three: null,
  Four: [4, 6, 5, 2, 1],
  Five: null,
  Six: null,
  "Three Of A Kind": [2, 3, 4, 2, 2],
  "Four Of A Kind": null,
  "Full House": null,
  "Small Straight": [1, 2, 3, 2, 3],
  "Large Straight": null,
  Yahtzee: [1, 2, 3, 4, 5],
  Chance: null,
};
