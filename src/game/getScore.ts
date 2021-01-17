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

const upScore = (n: number) => (set: number[]) =>
  set.reduce((s, x) => s + (x === n ? n : 0), 0);

const sumScore = (set: number[]) => set.reduce((s, x) => s + x, 0);

const count = (set: number[]) => {
  const o = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const n of set) (o as any)[n]++;

  return o;
};

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

    case "Small Straight": {
      const cc = Object.keys(count(set));
      return (cc[1] && cc[2] && cc[3] && cc[4]) ||
        (cc[2] && cc[3] && cc[4] && cc[5]) ||
        (cc[3] && cc[4] && cc[5] && cc[6])
        ? 30
        : 0;
    }

    case "Large Straight": {
      const cc = Object.keys(count(set));
      return (cc[1] && cc[2] && cc[3] && cc[4] && cc[5]) ||
        (cc[2] && cc[3] && cc[4] && cc[5] && cc[6])
        ? 40
        : 0;
    }

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

export const State = {};
