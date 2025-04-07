import {
  createEmptyScoreSheet,
  isScoreSheetFinished,
  isDiceValue,
  Category,
  DiceValue,
  ScoreSheet,
} from "./types";

export const nDice = 5;
export const nReroll = 2;

export type Game = {
  scoreSheet: ScoreSheet;
  pickedDice: Record<number, boolean | undefined>;
  remainingReRoll: number;
  roll: (DiceValue | "rolling")[] | (DiceValue | "blank")[];
};

const arrayEquals = <T>(a: T[], b: T[]) =>
  a.length === b.length && a.every((_, i) => a[i] === b[i]);

export const isRolling = (d: DiceValue | "rolling" | "blank"): d is "rolling" =>
  d === "rolling";

export const isBlank = (d: DiceValue | "rolling" | "blank"): d is "blank" =>
  d === "blank";

export const isRollReady = (roll: Game["roll"]) => roll.every(isDiceValue);

export const setRoll = (game: Game, roll: (DiceValue | "rolling")[]): Game => {
  if (!arrayEquals(game.roll, roll)) return { ...game, roll };
  return game;
};
export const togglePickedDice = (game: Game, diceIndex: number): Game => {
  // forbid to pick a dice without value
  if (!isDiceValue(game.roll[diceIndex])) return game;

  if (game.remainingReRoll <= 0) return game;

  if (game.pickedDice[diceIndex])
    return {
      ...game,
      pickedDice: { ...game.pickedDice, [diceIndex]: undefined },
    };
  else
    return {
      ...game,
      pickedDice: { ...game.pickedDice, [diceIndex]: true },
    };
};
export const selectCategoryForDiceRoll = (
  game: Game,
  category: Category
): Game => {
  if (!isRollReady(game.roll)) return game;
  if (game.scoreSheet[category]) return game;

  const scoreSheet = { ...game.scoreSheet, [category]: game.roll.slice() };

  if (isScoreSheetFinished(scoreSheet))
    return {
      ...game,
      pickedDice: {},
      scoreSheet,
      remainingReRoll: 0,
    };

  return {
    ...game,
    pickedDice: Object.fromEntries(
      Array.from({ length: nDice }, (_, i) => [i, true])
    ),
    scoreSheet,
    remainingReRoll: nReroll,
    roll: Array.from({ length: nDice }, () => "blank"),
  };
};

export const validateReroll = (game: Game): Game => {
  if (game.remainingReRoll <= 0) return game;
  if (!Object.values(game.pickedDice).some(Boolean)) return game;
  if (!game.roll.every(isDiceValue)) return game;

  const roll = game.roll.map((value, i) =>
    game.pickedDice[i] ? "blank" : value
  );

  return { ...game, remainingReRoll: game.remainingReRoll - 1, roll };
};

export const startRolling = (game: Game): Game => {
  if (!game.roll.some((dice) => dice === "blank")) return game;

  const roll = game.roll.map((value) =>
    value === "blank" ? "rolling" : value
  );
  return { ...game, pickedDice: {}, roll };
};

export const createEmptyGame = (): Game => ({
  scoreSheet: createEmptyScoreSheet(),
  pickedDice: Object.fromEntries(
    Array.from({ length: nDice }, (_, i) => [i, true])
  ),
  remainingReRoll: nReroll,
  roll: Array.from({ length: nDice }, () => "blank"),
});

export const getStatus = (game: Game) => {
  if (isScoreSheetFinished(game.scoreSheet)) return "finished" as const;
  if (game.roll.some(isRolling)) return "rolling" as const;
  if (game.roll.some(isBlank)) return "wait-for-throw" as const;
  return "wait-reroll-or-mark" as const;
};
