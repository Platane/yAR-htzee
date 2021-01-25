import { Category } from "./types";

export const getScore = (category: Category, set: number[]) => {
  switch (category) {
    case "Aces":
      return upScore(1)(set);
    case "Two":
      return upScore(2)(set);
    case "Three":
      return upScore(3)(set);
    case "Four":
      return upScore(4)(set);
    case "Five":
      return upScore(5)(set);
    case "Six":
      return upScore(6)(set);

    case "Small Straight":
      return maxChainLength(set) >= 4 ? 30 : 0;

    case "Large Straight":
      return maxChainLength(set) >= 5 ? 40 : 0;

    case "Three Of A Kind":
      return Object.values(count(set)).some((n) => n >= 3) ? sumScore(set) : 0;

    case "Four Of A Kind":
      return Object.values(count(set)).some((n) => n >= 4) ? sumScore(set) : 0;

    case "Yahtzee":
      return Object.values(count(set)).some((n) => n >= 5) ? 50 : 0;

    case "Full House": {
      const cc = Object.values(count(set));
      return cc.some((n) => n === 3) && cc.some((n) => n === 2) ? 25 : 0;
    }

    case "Chance":
      return sumScore(set);
  }
};

const maxChainLength = (set: number[]) =>
  Math.max(...set.map((u) => lengthOfChainStartingWith(u, set)));

const lengthOfChainStartingWith = (n: number, set: number[]): number => {
  if (set.some((u) => u === n))
    return 1 + lengthOfChainStartingWith(n + 1, set);
  return 0;
};

const upScore = (n: number) => (set: number[]) =>
  set.reduce((s, x) => s + (x === n ? n : 0), 0);

const sumScore = (set: number[]) => set.reduce((s, x) => s + x, 0);

const count = (set: number[]) => {
  const o = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const n of set) (o as any)[n]++;

  return o;
};
