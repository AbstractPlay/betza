import "mocha";
import { expect } from "chai";
import { Piece } from "../../src/Piece";
import { generateMoves } from "../../src/generateMoves";
import { boardFromGrid, squareCtx } from "../helpers";

const empty = () => boardFromGrid([
  ".......",
  ".......",
  ".......",
  "...F...",
  ".......",
  ".......",
  ".......",
]);

const targets = (betza: string): string[] => {
  const board = empty();
  const moves = generateMoves(new Piece(betza, betza, squareCtx), 3, 3, board);
  return [...new Set(moves.map(([x, y]) => `${x},${y}`))].sort();
};

describe("moveGen – Tori Shogi pieces", () => {
  it("phoenix (K) steps one square in any direction", () => {
    expect(targets("K")).to.have.length(8);
  });

  it("falcon (FfrlW) steps anywhere except straight back", () => {
    expect(targets("FfrlW")).to.have.length(7);
    expect(targets("FfrlW")).not.to.include("3,2");
  });

  it("crane (FfbW) steps diagonally, forward, or back", () => {
    expect(targets("FfbW")).to.have.members(
      ["2,2", "4,2", "2,4", "4,4", "3,4", "3,2"].sort());
  });

  it("pheasant (fDbF) jumps two forward or steps a diagonal back", () => {
    expect(targets("fDbF")).to.have.members(["3,5", "2,2", "4,2"].sort());
  });

  it("goose (fAbD) jumps two diagonally forward or two straight back", () => {
    expect(targets("fAbD")).to.have.members(["1,5", "5,5", "3,1"].sort());
  });

  it("left quail (fRbrBblF) ranges forward and backward-right", () => {
    expect(targets("fRbrBblF")).to.have.members(
      ["3,4", "3,5", "3,6", "4,2", "5,1", "6,0", "2,2"].sort());
  });

  it("right quail (fRblBbrF) mirrors the left quail", () => {
    expect(targets("fRblBbrF")).to.have.members(
      ["3,4", "3,5", "3,6", "2,2", "1,1", "0,0", "4,2"].sort());
  });

  it("eagle (fBbRWbB2) ranges backward diagonally only two squares", () => {
    expect(targets("fBbRWbB2")).to.include.members(["2,2", "1,1", "4,2", "5,1"]);
    expect(targets("fBbRWbB2")).not.to.include("0,0");

    const board = boardFromGrid([
      ".......",
      ".F.....",
      ".......",
      "...F...",
      ".......",
      ".......",
      ".......",
    ]);
    const eagle = new Piece("eagle", "fBbRWbB2", squareCtx);
    const moves = generateMoves(eagle, 3, 3, board).map(([x, y]) => `${x},${y}`);
    expect(moves).to.include("2,2");
    expect(moves).not.to.include("1,1");
  });
});
