import "mocha";
import { expect } from "chai";
import { Piece } from "../../src/Piece";
import { generateMoves } from "../../src/generateMoves";
import { leapPath } from "../../src/generateMoves/utils";
import { boardFromGrid, squareCtx } from "../helpers";

describe("moveGen – blockable leaps (n)", () => {
  it("walks a leap out as a straight run and then a diagonal one", () => {
    expect(leapPath(1, 2)).to.deep.equal([[0, 1], [1, 2]]);
    expect(leapPath(2, 2)).to.deep.equal([[1, 1], [2, 2]]);
    expect(leapPath(2, 3)).to.deep.equal([[0, 1], [1, 2], [2, 3]]);
    expect(leapPath(0, 2)).to.deep.equal([[0, 1], [0, 2]]);
    expect(leapPath(-2, -3)).to.deep.equal([[0, -1], [-1, -2], [-2, -3]]);
  });

  it("blocks a horse by the square in front of it, not beside it", () => {
    const blocked = boardFromGrid([
      ".....",
      "..F..",
      "..F..",
      ".....",
      ".....",
    ]);
    const horse = new Piece("nN", "nN", squareCtx);
    const moves = generateMoves(horse, 2, 2, blocked);
    expect(moves).to.not.deep.include([1, 0]);
    expect(moves).to.not.deep.include([3, 0]);
    expect(moves).to.deep.include([0, 1]);
    expect(moves).to.deep.include([1, 4]);
    expect(moves).to.have.length(6);
  });

  it("leaves a plain knight alone", () => {
    const blocked = boardFromGrid([
      ".....",
      "..F..",
      "..F..",
      ".....",
      ".....",
    ]);
    const knight = new Piece("N", "N", squareCtx);
    expect(generateMoves(knight, 2, 2, blocked)).to.have.length(8);
  });

  it("blocks an elephant at the eye of its leap", () => {
    const board = boardFromGrid([
      ".....",
      ".F...",
      "..F..",
      ".....",
      ".....",
    ]);
    const elephant = new Piece("nA", "nA", squareCtx);
    const moves = generateMoves(elephant, 2, 2, board);
    expect(moves).to.not.deep.include([0, 0]);
    expect(moves).to.have.length(3);
  });

  it("lets a blocked leaper still capture at the far end", () => {
    const board = boardFromGrid([
      ".E...",
      ".....",
      "..F..",
      ".....",
      ".....",
    ]);
    const horse = new Piece("nN", "nN", squareCtx);
    expect(generateMoves(horse, 2, 2, board)).to.deep.include([1, 0]);
  });
});
