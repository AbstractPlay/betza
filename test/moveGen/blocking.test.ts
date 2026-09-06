import "mocha";
import { expect } from "chai";
import { Piece } from "../../src/Piece";
import { generateMoves } from "../../src/generateMoves";
import { boardFromGrid, squareCtx } from "../helpers";

const behindAFriend = boardFromGrid(["..FE..."]);

const twoEnemies = boardFromGrid(["....EE."]);

const from = (betza: string, board: ReturnType<typeof boardFromGrid>, x: number) =>
  generateMoves(new Piece(betza, betza, squareCtx), x, 0, board).map(([f]) => f).sort((a, b) => a - b);

describe("moveGen – blocking is not a question about capturing", () => {
  it("stops a plain rook at the piece in front of it", () => {
    expect(from("R", behindAFriend, 1)).to.deep.equal([0]);
  });

  it("stops a non-capturing rook (m) in the same place", () => {
    expect(from("mR", behindAFriend, 1)).to.deep.equal([0]);
  });

  it("a capture-only rook stops on the first enemy", () => {
    expect(from("cR", twoEnemies, 2)).to.deep.equal([4]);
  });

  it("a cannon hopper crosses exactly one platform", () => {
    expect(from("pR", twoEnemies, 2)).to.deep.equal([5]);
  });
});
