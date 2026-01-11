import "mocha";
import { expect } from "chai";
import { parseBetza } from "../src/Piece/parseBetza";
import { expandAtom } from "../src/Piece/expandAtom";
import { generateMoves } from "../src/generateMoves";
import { classifyGeometry, DIRECTION_MAP } from "../src/Geometry";
import { Piece } from "../src/Piece";
import { boardFromGrid, squareCtx } from "./helpers";

//
// Utility for building modifier sets
//
function mods(extra = {}) {
  return {
    moveOnly: false,
    captureOnly: false,
    hopCount: 0,
    directionsRestricted: false,
    allowedDirections: undefined,

    requiresClearPath: false,
    againRider: false,
    hopStyle: undefined,

    zigzag: false,
    takeAndContinue: false,
    unblockable: false,
    mustCaptureFirst: false,
    mustNotCaptureFirst: false,
    captureThenLeap: false,

    ...extra
  };
}

//
// ─────────────────────────────────────────────
//   ATOM EXPANSION TESTS
// ─────────────────────────────────────────────
//

describe("expandAtom – atoms", () => {

  it("expands W", () => {
    const a = expandAtom("W", mods());
    expect(a.kind).to.equal("leap");
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["W"]);
    expect(a.maxSteps).to.equal(1);
  });

  it("expands F", () => {
    const a = expandAtom("F", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["F"]);
  });

  it("expands N", () => {
    const a = expandAtom("N", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["N"]);
  });

  it("expands D", () => {
    const a = expandAtom("D", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["D"]);
  });

  it("expands A", () => {
    const a = expandAtom("A", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["A"]);
  });

  it("expands E", () => {
    const a = expandAtom("E", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["E"]);
  });

  it("expands C", () => {
    const a = expandAtom("C", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["C"]);
  });

  it("expands Z", () => {
    const a = expandAtom("Z", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["Z"]);
  });

  it("expands H (nightrider)", () => {
    const a = expandAtom("H", mods());
    expect(a.kind).to.equal("slide");
    expect(a.maxSteps).to.equal(Infinity);
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["N"]);
  });

  it("expands G (giraffe)", () => {
    const a = expandAtom("G", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["G"]);
  });

  it("expands S (squirrel)", () => {
    const a = expandAtom("S", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["S"]);
  });

  it("expands P (pawn)", () => {
    const a = expandAtom("P", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["P"]);
  });

  it("throws on unknown atom", () => {
    expect(() => expandAtom("?", mods())).to.throw();
  });

  it("geometry: slide pieces get maxSteps = Infinity", () => {
    const a = expandAtom("R", mods());
    expect(a.kind).to.equal("slide");
    expect(a.maxSteps).to.equal(Infinity);
  });

  it("geometry: leap pieces get maxSteps = 1", () => {
    const a = expandAtom("N", mods());
    expect(a.kind).to.equal("leap");
    expect(a.maxSteps).to.equal(1);
  });

  it("geometry: hop pieces get kind = hop", () => {
    const a = expandAtom("W", mods({ hopStyle: "grasshopper", hopCount: 1 }));
    expect(a.kind).to.equal("hop");
    expect(a.hopStyle).to.equal("grasshopper");
  });
});

//
// ─────────────────────────────────────────────
//   MODIFIER SEMANTICS
// ─────────────────────────────────────────────
//

describe("expandAtom – modifiers", () => {

  it("againRider (a)", () => {
    const a = expandAtom("N", mods({ againRider: true }));
    expect(a.kind).to.equal("slide");
    expect(a.maxSteps).to.equal(Infinity);
  });

  it("requiresClearPath (p)", () => {
    const a = expandAtom("A", mods({ requiresClearPath: true }));
    expect(a.requiresClearPath).to.equal(true);
  });

  it("grasshopper (g)", () => {
    const a = expandAtom("W", mods({ hopStyle: "grasshopper", hopCount: 1 }));
    expect(a.kind).to.equal("hop");
    expect(a.hopStyle).to.equal("grasshopper");
  });

  it("zigzag (z)", () => {
    const a = expandAtom("F", mods({ zigzag: true }));
    expect(a.zigzag).to.equal(true);
  });

  it("takeAndContinue (t)", () => {
    const a = expandAtom("W", mods({ takeAndContinue: true }));
    expect(a.takeAndContinue).to.equal(true);
  });

  it("unblockable (u)", () => {
    const a = expandAtom("N", mods({ unblockable: true }));
    expect(a.unblockable).to.equal(true);
  });

  it("mustCaptureFirst (o)", () => {
    const a = expandAtom("F", mods({ mustCaptureFirst: true }));
    expect(a.mustCaptureFirst).to.equal(true);
  });

  it("mustNotCaptureFirst (x)", () => {
    const a = expandAtom("F", mods({ mustNotCaptureFirst: true }));
    expect(a.mustNotCaptureFirst).to.equal(true);
  });

  it("captureThenLeap (y)", () => {
    const a = expandAtom("N", mods({ captureThenLeap: true }));
    expect(a.captureThenLeap).to.equal(true);
  });

  it("y overrides o and x", () => {
    const a = expandAtom("N", mods({
      mustCaptureFirst: true,
      mustNotCaptureFirst: true,
      captureThenLeap: true
    }));
    expect(a.captureThenLeap).to.equal(true);
    expect(a.mustCaptureFirst).to.equal(false);
    expect(a.mustNotCaptureFirst).to.equal(false);
  });

  it("againRider converts leap → slide but keeps deltas", () => {
    const a = expandAtom("N", mods({ againRider: true }));
    expect(a.kind).to.equal("slide");
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["N"]);
  });

  it("grasshopper forces hop geometry even on slide pieces", () => {
    const a = expandAtom("R", mods({ hopStyle: "grasshopper", hopCount: 1 }));
    expect(a.kind).to.equal("hop");
    expect(a.hopStyle).to.equal("grasshopper");
  });
});

//
// ─────────────────────────────────────────────
//   PARSER TESTS
// ─────────────────────────────────────────────
//

describe("parseBetza", () => {

  it("parses single atom", () => {
    const a = parseBetza("N");
    expect(a[0].deltasAbstract).to.deep.equal(DIRECTION_MAP["N"]);
  });

  it("parses multiple atoms", () => {
    const a = parseBetza("WFN");
    expect(a.length).to.equal(3);
  });

  it("parses all modifiers", () => {
    const a = parseBetza("mapztoxyuN")[0];

    expect(a.moveOnly).to.equal(true);
    expect(a.againRider).to.equal(true);
    expect(a.requiresClearPath).to.equal(true);
    expect(a.zigzag).to.equal(true);
    expect(a.takeAndContinue).to.equal(true);
    expect(a.unblockable).to.equal(true);

    expect(a.mustCaptureFirst).to.equal(false);
    expect(a.mustNotCaptureFirst).to.equal(false);
    expect(a.captureThenLeap).to.equal(true);
  });

  it("geometry: parser correctly assigns slide geometry", () => {
    const a = parseBetza("R")[0];
    expect(a.kind).to.equal("slide");
    expect(a.maxSteps).to.equal(Infinity);
  });

  it("geometry: parser correctly assigns leap geometry", () => {
    const a = parseBetza("N")[0];
    expect(a.kind).to.equal("leap");
    expect(a.maxSteps).to.equal(1);
  });

  it("geometry: parser correctly assigns hop geometry via prefix", () => {
    const a = parseBetza("gR")[0];
    expect(a.kind).to.equal("hop");
    expect(a.hopStyle).to.equal("grasshopper");
  });
});

//
// ─────────────────────────────────────────────
//   MOVE GENERATOR TESTS — LEAP
// ─────────────────────────────────────────────
//

describe("moveGenerator – leap", () => {

  it("knight moves", () => {
    const board = boardFromGrid([
      ".....",
      ".....",
      "..F..",
      ".....",
      ".....",
    ]);

    const piece = new Piece("N", "N", squareCtx);
    const moves = generateMoves(piece, 2, 2, board);

    expect(moves).to.have.length(8);
  });

  it("mustCaptureFirst blocks empty squares", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      "..."
    ]);

    const piece = new Piece("oN", "oN", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);

    expect(moves).to.have.length(0);
  });

  it("captureThenLeap works", () => {
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
    const moves = generateMoves(piece, 3, 3, board);

    expect(moves).to.deep.include([5, 7]);
  });

  it("geometry: leap pieces ignore blocking pieces", () => {
    const board = boardFromGrid([
      ".....",
      "..E..",
      "..F..",
      "..E..",
      "....."
    ]);

    const piece = new Piece("N", "N", squareCtx);
    const moves = generateMoves(piece, 2, 2, board);

    expect(moves).to.have.length(8);
  });
});


//
// ─────────────────────────────────────────────
//   SLIDE
// ─────────────────────────────────────────────
//

describe("moveGenerator – slide", () => {

  it("rook moves", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      "..."
    ]);

    const piece = new Piece("R", "R", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);

    expect(moves).to.have.length(4);
  });

  it("unblockable passes through pieces", () => {
    const board = boardFromGrid([
      ".E.",
      ".F.",
      ".E."
    ]);

    const piece = new Piece("uR", "uR", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);

    expect(moves).to.deep.include([1, 0]);
    expect(moves).to.deep.include([1, 2]);
  });

  it("takeAndContinue continues sliding after capture", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      ".E.",
      "..."
    ]);

    const piece = new Piece("tR", "tR", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);

    expect(moves).to.deep.include([1, 2]);
    expect(moves).to.deep.include([1, 3]);
  });

  it("geometry: slide pieces stop at board edge", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      "..."
    ]);

    const piece = new Piece("R", "R", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);

    expect(moves).to.deep.include([1, 0]);
    expect(moves).to.deep.include([1, 2]);
  });
});


//
// ─────────────────────────────────────────────
//   HOP
// ─────────────────────────────────────────────
//

describe("moveGenerator – hop", () => {

  it("grasshopper hops over first piece", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      ".E.",
      "..."
    ]);

    const piece = new Piece("gW", "gW", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);

    expect(moves).to.deep.include([1, 3]);
  });

  it("geometry: hop pieces require a hurdle", () => {
    const board = boardFromGrid([
      "...",
      ".F.",
      "...",
      "..."
    ]);

    const piece = new Piece("gW", "gW", squareCtx);
    const moves = generateMoves(piece, 1, 1, board);

    expect(moves).to.deep.equal([]);
  });
});

// ─────────────────────────────────────────────
//   GEOMETRY CLASSIFICATION TESTS
// ─────────────────────────────────────────────

describe("geometry – classifyGeometry", () => {

it("classifies slides: R B Q H", () => {
  expect(classifyGeometry("R")).to.equal("slide");
  expect(classifyGeometry("B")).to.equal("slide");
  expect(classifyGeometry("Q")).to.equal("slide");
  expect(classifyGeometry("H")).to.equal("slide"); // nightrider
});

it("classifies steppers (W, F) as leaps", () => {
  expect(classifyGeometry("W")).to.equal("leap");
  expect(classifyGeometry("F")).to.equal("leap");
});

it("classifies leaps: N D A E C Z G S P", () => {
  expect(classifyGeometry("N")).to.equal("leap");
  expect(classifyGeometry("D")).to.equal("leap");
  expect(classifyGeometry("A")).to.equal("leap");
  expect(classifyGeometry("E")).to.equal("leap");
  expect(classifyGeometry("C")).to.equal("leap");
  expect(classifyGeometry("Z")).to.equal("leap");
  expect(classifyGeometry("G")).to.equal("leap");
  expect(classifyGeometry("S")).to.equal("leap");
  expect(classifyGeometry("P")).to.equal("leap");
});

it("classifies H (nightrider) as slide", () => {
  expect(classifyGeometry("H")).to.equal("slide");
});

  it("classifies hops: g h", () => {
    expect(classifyGeometry("g")).to.equal("hop");
    expect(classifyGeometry("h")).to.equal("hop");
  });

  it("lowercase = hop, uppercase = leap fallback", () => {
    expect(classifyGeometry("x")).to.equal("hop");
    expect(classifyGeometry("Z")).to.equal("leap");
  });
});

// ─────────────────────────────────────────────
//   GEOMETRY – DIRECTION MAP
// ─────────────────────────────────────────────

describe("geometry – DIRECTION_MAP", () => {

  it("rook directions include orthogonal deltas", () => {
    expect(DIRECTION_MAP["R"]).to.deep.include([1, 0]);
    expect(DIRECTION_MAP["R"]).to.deep.include([0, -1]);
  });

  it("knight directions include L‑shapes", () => {
    expect(DIRECTION_MAP["N"]).to.deep.include([1, 2]);
    expect(DIRECTION_MAP["N"]).to.deep.include([-2, 1]);
  });

  it("bishop directions include diagonals", () => {
    expect(DIRECTION_MAP["B"]).to.deep.include([1, 1]);
    expect(DIRECTION_MAP["B"]).to.deep.include([-1, -1]);
  });

  it("unknown symbols fall back to empty array", () => {
    expect(DIRECTION_MAP["?"] ?? []).to.deep.equal([]);
  });
});
