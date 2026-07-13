import "mocha";
import { expect } from "chai";
import { Piece } from "../../src/Piece";
import { generateMoves } from "../../src/generateMoves";
import { boardFromGrid, squareCtx } from "../helpers";

function emptyBoard8(): string[] {
  return Array.from({ length: 8 }, () => "........");
}

describe("moveGen – atoms", () => {
  it("wazir W from center of 8x8", () => {
    const board = boardFromGrid(emptyBoard8());
    const piece = new Piece("wazir", "W", squareCtx);
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.deep.members([
      [5, 4],
      [3, 4],
      [4, 5],
      [4, 3],
    ]);
  });

  it("ferz F from center of 8x8", () => {
    const board = boardFromGrid(emptyBoard8());
    const piece = new Piece("ferz", "F", squareCtx);
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.deep.members([
      [5, 5],
      [5, 3],
      [3, 5],
      [3, 3],
    ]);
  });

  it("knight N from center of 8x8", () => {
    const board = boardFromGrid(emptyBoard8());
    const piece = new Piece("knight", "N", squareCtx);
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.deep.members([
      [5, 6],
      [6, 5],
      [6, 3],
      [5, 2],
      [3, 2],
      [2, 3],
      [2, 5],
      [3, 6],
    ]);
  });

  it("rook R from center of 8x8", () => {
    const board = boardFromGrid(emptyBoard8());
    const piece = new Piece("rook", "R", squareCtx);
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.length(14);
    expect(moves).to.deep.include([0, 4]);
    expect(moves).to.deep.include([7, 4]);
    expect(moves).to.deep.include([4, 0]);
    expect(moves).to.deep.include([4, 7]);
  });

  it("bishop B from center of 8x8", () => {
    const board = boardFromGrid(emptyBoard8());
    const piece = new Piece("bishop", "B", squareCtx);
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.length(13);
    expect(moves).to.deep.include([0, 0]);
    expect(moves).to.deep.include([7, 7]);
    expect(moves).to.deep.include([1, 7]);
    expect(moves).to.deep.include([7, 1]);
  });

  it("queen Q from center of 8x8", () => {
    const board = boardFromGrid(emptyBoard8());
    const piece = new Piece("queen", "Q", squareCtx);
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.length(27);
  });

  it("king K from center of 8x8", () => {
    const board = boardFromGrid(emptyBoard8());
    const piece = new Piece("king", "K", squareCtx);
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.length(8);
  });

  it("deduplicates overlapping atom destinations", () => {
    const board = boardFromGrid(emptyBoard8());
    const piece = new Piece("king-wf", "WF", squareCtx);
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.length(8);
  });
});
