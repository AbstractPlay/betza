import "mocha";
import { expect } from "chai";
import { Piece } from "../../src/Piece";
import { HexAxialGeometry } from "../../src/Geometry";
import { generateMoves } from "../../src/generateMoves";
import { selectByHalfPlanes } from "../../src/Geometry/directionModifiers";
import { boardFromGrid } from "../helpers";
import { hexCtx } from "./helpers";

const emptyHex = () =>
  boardFromGrid(Array.from({ length: 20 }, () => ".".repeat(20)));

describe("HexAxialGeometry – direction modifiers", () => {
  it("selectByHalfPlanes keeps forward wazir directions (dr > 0)", () => {
    const wazir = HexAxialGeometry.atomDeltas("W", [], hexCtx);
    const forward = selectByHalfPlanes(wazir, "f");
    expect(forward).to.have.deep.members([
      { df: 0, dr: 1 },
      { df: -1, dr: 1 },
    ]);
  });

  it("selectByHalfPlanes keeps forward rook rays only", () => {
    const rook = HexAxialGeometry.atomDeltas("R", [], hexCtx);
    const forward = selectByHalfPlanes(rook, "f");
    expect(forward).to.have.deep.members([
      { df: 0, dr: 1 },
      { df: -1, dr: 1 },
    ]);
  });

  it("intersects perpendicular modifiers (fl)", () => {
    const wazir = HexAxialGeometry.atomDeltas("W", [], hexCtx);
    const forwardLeft = selectByHalfPlanes(wazir, "fl");
    expect(forwardLeft).to.deep.equal([{ df: -1, dr: 1 }]);
  });

  it("constructs a directional hex piece without throwing", () => {
    expect(
      () => new Piece("fW", "fW", hexCtx, HexAxialGeometry),
    ).to.not.throw();
  });

  it("fW on hex generates only forward wazir steps from center", () => {
    const board = emptyHex();
    const piece = new Piece("fW", "fW", hexCtx, HexAxialGeometry);
    const moves = generateMoves(piece, 10, 10, board).map(
      ([x, y]) => `${x},${y}`,
    );
    expect(moves.sort()).to.deep.equal(["10,11", "9,11"].sort());
  });
});

describe("HexAxialGeometry – black side orientation", () => {
  const board = emptyHex();
  const center = 10;

  it("a forward step moves toward the lower rank for black", () => {
    const white = new Piece("pawn", "fW", hexCtx, HexAxialGeometry, "white");
    const black = new Piece("pawn", "fW", hexCtx, HexAxialGeometry, "black");
    expect(generateMoves(white, center, center, board)).to.deep.include([
      center,
      center + 1,
    ]);
    expect(generateMoves(black, center, center, board)).to.deep.include([
      center,
      center - 1,
    ]);
    expect(generateMoves(black, center, center, board)).to.not.deep.include([
      center,
      center + 1,
    ]);
  });

  it("fW for black moves in black-forward half-plane", () => {
    const whiteForward = new Piece(
      "fW",
      "fW",
      hexCtx,
      HexAxialGeometry,
      "white",
    );
    const blackForward = new Piece(
      "fW",
      "fW",
      hexCtx,
      HexAxialGeometry,
      "black",
    );
    const whiteBack = new Piece("bW", "bW", hexCtx, HexAxialGeometry, "white");

    const whiteMoves = generateMoves(whiteForward, center, center, board);
    const blackMoves = generateMoves(blackForward, center, center, board);
    const whiteBackMoves = generateMoves(whiteBack, center, center, board);

    expect(blackMoves).to.have.deep.members(whiteBackMoves);
    expect(blackMoves).to.not.have.deep.members(whiteMoves);
  });
});
