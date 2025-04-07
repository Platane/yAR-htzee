import {
  createEmptyGame,
  setRoll,
  startRolling,
  togglePickedDice,
  validateReroll,
} from "../game";
import { it, expect } from "bun:test";

it("should play game", () => {
  let game = createEmptyGame();
  expect(game.roll).toEqual(["blank", "blank", "blank", "blank", "blank"]);

  game = startRolling(game);
  game = setRoll(game, [1, 2, 3, "rolling", 4]);

  expect(game.roll).toEqual([1, 2, 3, "rolling", 4]);

  game = setRoll(game, [1, 2, 3, 1, 4]);
  game = togglePickedDice(game, 2);
  game = validateReroll(game);

  expect(game.roll).toEqual([1, 2, "blank", 1, 4]);

  game = setRoll(game, [1, 2, 6, 1, 4]);
  expect(game.roll).toEqual([1, 2, 6, 1, 4]);
});

it("should guard against rolling if nothing is picked", () => {
  const game = setRoll(createEmptyGame(), [1, 2, 3, 2, 4]);
  expect(game).toBe(startRolling(game));
});
