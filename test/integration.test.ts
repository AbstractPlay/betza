import "mocha";
import { expect } from "chai";
import { Piece } from "../src/Piece";
import { RectBoard, HexBoard } from "../src/Board";
import { HexAxialGeometry } from "../src/Geometry";
import { generateMoves } from "../src/generateMoves";

describe("integration – Piece + board geometryContext", () => {
  it("RectBoard + Piece uses board dimensions", () => {
    const board = new RectBoard([
      ".....",
      ".....",
      "..F..",
      ".....",
      ".....",
    ]);
    const piece = new Piece("knight", "N", board.geometryContext);
    const moves = generateMoves(piece, 2, 2, board);
    expect(moves).to.have.length(8);
  });

  it("HexBoard + HexAxialGeometry rook", () => {
    const board = new HexBoard(
      Array.from({ length: 10 }, () => ".........."),
    );
    const piece = new Piece(
      "hexrook",
      "R",
      board.geometryContext,
      HexAxialGeometry,
    );
    const moves = generateMoves(piece, 5, 5, board);
    expect(moves.length).to.be.greaterThan(0);
  });

  it("HexBoard + take-and-continue rook", () => {
    const rows = Array.from({ length: 10 }, () => "..........");
    const board = new HexBoard(rows);
    const piece = new Piece(
      "hextrrook",
      "tR",
      board.geometryContext,
      HexAxialGeometry,
    );
    const moves = generateMoves(piece, 5, 5, board);
    expect(moves.length).to.be.greaterThan(0);
  });

  it("Piece with default 8x8 context on larger board still generates moves", () => {
    const board = new RectBoard([
      "........",
      "........",
      "........",
      "........",
      "....F...",
      "........",
      "........",
      "........",
    ]);
    const piece = new Piece("rook", "R");
    const moves = generateMoves(piece, 4, 4, board);
    expect(moves).to.have.length(14);
  });
});
