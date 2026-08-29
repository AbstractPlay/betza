import "mocha";
import { expect } from "chai";
import { Piece } from "../../src/Piece";
import { parseBetza } from "../../src/Piece/parseBetza";
import { generateMoves, handleCaptureThenLeap } from "../../src/generateMoves";
import { boardFromGrid, squareCtx } from "../helpers";

describe("moveGen – modifiers", () => {
  it("moveOnly (m) excludes captures", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      ".E.",
      "...",
    ]);
    const piece = new Piece("mR", "mR", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);
    expect(moves).to.not.deep.include([1, 2]);
    expect(moves).to.deep.include([1, 0]);
  });

  it("captureOnly (c) excludes empty squares", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      ".E.",
      "...",
    ]);
    const piece = new Piece("cR", "cR", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);
    expect(moves).to.deep.equal([[1, 2]]);
  });

  it("mustNotCaptureFirst (x) excludes enemy squares on slide", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      ".E.",
      "...",
    ]);
    const piece = new Piece("xR", "xR", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);
    expect(moves).to.not.deep.include([1, 2]);
    expect(moves).to.deep.include([1, 0]);
  });

  it("requiresClearPath (p) stops at first blocker", () => {
    const board = boardFromGrid([
      ".....",
      "..E..",
      "..F..",
      ".....",
      ".....",
    ]);
    const piece = new Piece("pR", "pR", squareCtx);
    const moves = generateMoves(piece, 2, 2, board);
    expect(moves).to.not.deep.include([2, 0]);
    expect(moves).to.deep.include([2, 3]);
  });

  it("forward-only wazir (fW)", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      "...",
      "...",
    ]);
    const piece = new Piece("fW", "fW", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);
    expect(moves).to.deep.equal([[1, 2]]);
  });

  it("series rider (aN) slides like nightrider", () => {
    const board = boardFromGrid([
      "........",
      "........",
      "........",
      "....F...",
      "........",
      "........",
      "........",
      "........",
    ]);
    const piece = new Piece("aN", "aN", squareCtx);
    const moves = generateMoves(piece, 4, 3, board);
    expect(moves).to.deep.include([6, 4]);
    expect(moves).to.deep.include([5, 5]);
  });

  it("grasshopper rook (gR) lands beyond hurdle", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      ".......",
      "...F...",
      "...E...",
      ".......",
      ".......",
    ]);
    const piece = new Piece("gR", "gR", squareCtx);
    const moves = generateMoves(piece, 3, 3, board);
    expect(moves).to.deep.include([3, 5]);
  });

  it("locust rook (hR) requires enemy hurdle and empty landing", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      ".......",
      "...F...",
      "...E...",
      ".......",
      ".......",
    ]);
    const piece = new Piece("hR", "hR", squareCtx);
    const moves = generateMoves(piece, 3, 3, board);
    expect(moves).to.deep.equal([[3, 5]]);
  });

  it("locust rejects friendly hurdle", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      "...F...",
      "...F...",
      ".......",
      ".......",
      ".......",
    ]);
    const piece = new Piece("hR", "hR", squareCtx);
    const moves = generateMoves(piece, 3, 2, board);
    expect(moves).to.deep.equal([]);
  });

  it("cannon rook (jR) requires exactly one hurdle", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      "...F...",
      "...E...",
      ".......",
      ".......",
      ".......",
    ]);
    const piece = new Piece("jR", "jR", squareCtx);
    const moves = generateMoves(piece, 3, 2, board);
    expect(moves).to.deep.include([3, 5]);
    expect(moves).to.not.deep.include([3, 3]);
  });

  it("zigzag rook (zR) alternates direction each step", () => {
    const board = boardFromGrid([
      ".....",
      ".....",
      "..F..",
      ".....",
      ".....",
    ]);
    const piece = new Piece("zR", "zR", squareCtx);
    const moves = generateMoves(piece, 2, 2, board);
    expect(moves).to.deep.include([3, 2]);
    expect(moves).to.deep.include([3, 3]);
  });
});

describe("parseBetza – negative cases", () => {
  it("throws on empty string", () => {
    expect(() => parseBetza("")).to.throw();
  });

  it("throws on trailing modifiers without atom", () => {
    expect(() => parseBetza("m")).to.throw();
  });
});

describe("handleCaptureThenLeap", () => {
  it("returns leap targets beyond first enemy on path", () => {
    const board = boardFromGrid([
      "........",
      "........",
      "........",
      "...F....",
      "........",
      "....E...",
      "........",
      "........",
    ]);
    const piece = new Piece("yN", "yN", squareCtx);
    const atom = piece.atoms[0];
    const path = [
      { x: 4, y: 5, sq: board.get(4, 5) },
      { x: 5, y: 5, sq: board.get(5, 5) },
    ];
    const result = handleCaptureThenLeap(path, atom, board);
    expect(result.map((s) => [s.x, s.y])).to.deep.include([5, 7]);
  });
});
