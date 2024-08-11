import { getScore } from "../getScore";
import { categories, Category, DiceRoll } from "../types";

(
  [
    //
    { category: "Aces", roll: [1, 1, 1, 1, 2], score: 4 },
    { category: "Full House", roll: [1, 1, 1, 2, 2], score: 25 },
    { category: "Full House", roll: [1, 1, 1, 1, 2], score: 0 },
    { category: "Small Straight", roll: [1, 2, 3, 4, 2], score: 30 },
    { category: "Large Straight", roll: [1, 2, 3, 4, 5], score: 40 },
    { category: "Yahtzee", roll: [1, 2, 3, 4, 5], score: 0 },
    { category: "Yahtzee", roll: [2, 2, 2, 2, 2], score: 50 },
    { category: "Three Of A Kind", roll: [2, 4, 4, 3, 2], score: 0 },
    { category: "Three Of A Kind", roll: [2, 4, 4, 2, 2], score: 14 },
  ] as {
    category: Category;
    roll: DiceRoll;
    score: number;
  }[]
).forEach(({ category, roll, score }) =>
  it(`${category.padEnd(16, " ")} ${roll} should score ${score}`, () => {
    expect(getScore(category, roll)).toBe(score);
  })
);
