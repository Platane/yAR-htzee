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

export const fullScoreSheet: ScoreSheet = {
  Aces: [2, 3, 4, 1, 2],
  Two: [2, 3, 4, 1, 2],
  Three: [2, 3, 4, 1, 2],
  Four: [4, 6, 5, 2, 1],
  Five: [2, 3, 4, 1, 2],
  Six: [2, 3, 4, 1, 2],
  "Three Of A Kind": [2, 3, 4, 2, 2],
  "Four Of A Kind": [2, 3, 4, 1, 2],
  "Full House": [2, 3, 4, 1, 2],
  "Small Straight": [1, 2, 3, 2, 3],
  "Large Straight": [2, 3, 4, 1, 2],
  Yahtzee: [1, 2, 3, 4, 5],
  Chance: [2, 3, 4, 1, 2],
};
