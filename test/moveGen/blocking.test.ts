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

  it("stops a must-not-capture rook (x) in the same place", () => {
    expect(from("xR", behindAFriend, 1)).to.deep.equal([0]);
  });

  it("gives a must-capture rook (o) nothing behind a friendly piece", () => {
    expect(from("oR", behindAFriend, 1)).to.deep.equal([]);
  });

  it("gives a must-capture rook (o) the first enemy and not the second", () => {
    expect(from("oR", twoEnemies, 2)).to.deep.equal([4]);
  });

  it("stops a must-not-capture rook (x) short of the first enemy", () => {
    expect(from("xR", twoEnemies, 2)).to.deep.equal([0, 1, 3]);
  });

  it("lets a clear-path rook (p) take the piece it runs into", () => {
    expect(from("pR", twoEnemies, 2)).to.deep.equal(from("R", twoEnemies, 2));
  });
});
