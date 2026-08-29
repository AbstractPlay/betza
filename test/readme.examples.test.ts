import "mocha";
import { expect } from "chai";
import { Piece } from "../src/Piece";
import { RectBoard } from "../src/Board";
import { SquareRectGeometry } from "../src/Geometry";
import { generateMoves } from "../src/generateMoves";
import { parseBetza } from "../src/Piece/parseBetza";

describe("README examples", () => {
  it("quick start knight on 5x5", () => {
    const board = new RectBoard([
      ".....",
      ".....",
      "..F..",
      ".....",
      ".....",
    ]);

    const knight = new Piece("knight", "N", board.geometryContext);
    const moves = generateMoves(knight, 2, 2, board);

    expect(moves).to.have.deep.members([
      [3, 4],
      [4, 3],
      [4, 1],
      [3, 0],
      [1, 0],
      [0, 1],
      [0, 3],
      [1, 4],
    ]);
  });

  it("take-and-continue rook on 8x8", () => {
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
    const piece = new Piece("trrook", "tR", board.geometryContext);
    const moves = generateMoves(piece, 4, 4, board);

    expect(moves).to.have.deep.members([
      [5, 4],
      [6, 4],
      [7, 4],
      [3, 4],
      [2, 4],
      [1, 4],
      [0, 4],
      [4, 5],
      [4, 6],
      [4, 7],
      [4, 3],
      [4, 2],
      [4, 1],
      [4, 0],
    ]);
  });

  it("parseBetza examples from README compile", () => {
    expect(() => parseBetza("tuR")).to.not.throw();
    expect(() => parseBetza("yN")).to.not.throw();
    expect(() => parseBetza("pgB")).to.not.throw();
  });

  it("black pawn moves toward lower rank", () => {
    const board = new RectBoard([
      "........",
      "........",
      "........",
      "....F...",
      "........",
      "........",
      "........",
      "........",
    ]);
    const blackPawn = new Piece(
      "pawn",
      "P",
      board.geometryContext,
      SquareRectGeometry,
      "black",
    );
    const moves = generateMoves(blackPawn, 4, 3, board);
    expect(moves).to.deep.equal([[4, 2]]);
  });
});
