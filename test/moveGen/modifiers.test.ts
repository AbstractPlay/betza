import "mocha";
import { expect } from "chai";
import { Piece } from "../../src/Piece";
import { parseBetza } from "../../src/Piece/parseBetza";
import { generateMoves, handleCaptureThenLeap } from "../../src/generateMoves";
import { boardFromGrid, squareCtx } from "../helpers";
import { SquareRectGeometry } from "../../src/Geometry";

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

  it("forward knight and narrow forward knight", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      ".......",
      "...F...",
      ".......",
      ".......",
      ".......",
    ]);
    const forward = new Piece("fN", "fN", squareCtx);
    const narrow = new Piece("ffN", "ffN", squareCtx);
    expect(generateMoves(forward, 3, 3, board)).to.have.deep.members([
      [1, 4], [2, 5], [4, 5], [5, 4],
    ]);
    expect(generateMoves(narrow, 3, 3, board)).to.have.deep.members([
      [2, 5], [4, 5],
    ]);
  });

  it("selects the wide oblique leaps with s", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      ".......",
      "...F...",
      ".......",
      ".......",
      ".......",
    ]);
    const wide = new Piece("fsN", "fsN", squareCtx);
    expect(generateMoves(wide, 3, 3, board)).to.have.deep.members([[1, 4], [5, 4]]);
  });

  it("intersects perpendicular direction modifiers", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      ".......",
      "...F...",
      ".......",
      ".......",
      ".......",
    ]);
    const quadrant = new Piece("flN", "flN", squareCtx);
    const single = new Piece("fflN", "fflN", squareCtx);
    expect(generateMoves(quadrant, 3, 3, board)).to.have.deep.members([
      [2, 5], [1, 4],
    ]);
    expect(generateMoves(single, 3, 3, board)).to.deep.equal([[2, 5]]);
  });

  it("reads a perpendicular pair per component of a compound atom", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      ".......",
      "...F...",
      ".......",
      ".......",
      ".......",
    ]);
    expect(generateMoves(new Piece("frK", "frK", squareCtx), 3, 3, board))
      .to.have.deep.members([[3, 4], [4, 3], [4, 4]]);
    expect(generateMoves(new Piece("frB", "frB", squareCtx), 3, 3, board))
      .to.have.deep.members([[4, 4], [5, 5], [6, 6]]);
    expect(generateMoves(new Piece("frW", "frW", squareCtx), 3, 3, board))
      .to.have.deep.members([[3, 4], [4, 3]]);
  });

  it("reads s as sideways and v as vertical", () => {
    const board = boardFromGrid([
      ".....",
      ".....",
      "..F..",
      ".....",
      ".....",
    ]);
    const sideways = new Piece("sR", "sR", squareCtx);
    const vertical = new Piece("vR", "vR", squareCtx);
    expect(generateMoves(new Piece("lrR", "lrR", squareCtx), 2, 2, board))
      .to.have.deep.members(generateMoves(sideways, 2, 2, board));
    expect(generateMoves(sideways, 2, 2, board)).to.have.deep.members([
      [3, 2], [4, 2], [1, 2], [0, 2],
    ]);
    expect(generateMoves(vertical, 2, 2, board)).to.have.deep.members([
      [2, 3], [2, 4], [2, 1], [2, 0],
    ]);
  });

  it("restricts steppers and sliders to a half-plane", () => {
    const board = boardFromGrid([
      ".....",
      ".....",
      "..F..",
      ".....",
      ".....",
    ]);
    expect(generateMoves(new Piece("p", "fW", squareCtx), 2, 2, board))
      .to.deep.equal([[2, 3]]);
    expect(generateMoves(new Piece("l", "fR", squareCtx), 2, 2, board))
      .to.have.deep.members([[2, 3], [2, 4]]);
    expect(generateMoves(new Piece("g", "fF", squareCtx), 2, 2, board))
      .to.have.deep.members([[3, 3], [1, 3]]);
  });

  it("orients directional pieces for black", () => {
    const board = boardFromGrid([
      ".......",
      ".......",
      ".......",
      "...F...",
      ".......",
      ".......",
      ".......",
    ]);
    const pawn = new Piece("pawn", "P", squareCtx, SquareRectGeometry, "black");
    const knight = new Piece("knight", "ffN", squareCtx, SquareRectGeometry, "black");
    expect(generateMoves(pawn, 3, 3, board)).to.deep.equal([[3, 2]]);
    expect(generateMoves(knight, 3, 3, board)).to.have.deep.members([[2, 1], [4, 1]]);
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

describe("moveGen – crooked sliders (z)", () => {
  it("alternates between two directions rather than turning the same way", () => {
    const board = boardFromGrid([
      ".....",
      ".....",
      ".....",
      ".....",
      ".....",
    ]);
    const moves = generateMoves(new Piece("zB", "zB", squareCtx), 2, 2, board)
      .map(([x, y]) => `${x},${y}`);
    expect(moves.sort()).to.deep.equal(
      ["1,1", "0,2", "2,0", "3,1", "1,3", "4,2", "2,4", "3,3"].sort());
    expect(moves).to.not.include("4,4");
    expect(moves).to.not.include("0,0");
    expect(moves).to.not.include("2,2");
  });

  it("is blocked like any other rider", () => {
    const board = boardFromGrid([
      ".....",
      "...E.",
      ".....",
      ".F...",
      ".....",
    ]);
    const moves = generateMoves(new Piece("zB", "zB", squareCtx), 2, 2, board)
      .map(([x, y]) => `${x},${y}`);
    expect(moves).to.not.include("1,3");
    expect(moves).to.include("3,1");
    expect(moves).to.include("3,3");
    const quiet = generateMoves(new Piece("mzB", "mzB", squareCtx), 2, 2, board)
      .map(([x, y]) => `${x},${y}`);
    expect(quiet).to.not.include("3,1");
    const takes = generateMoves(new Piece("czB", "czB", squareCtx), 2, 2, board)
      .map(([x, y]) => `${x},${y}`);
    expect(takes).to.deep.equal(["3,1"]);
  });
});
