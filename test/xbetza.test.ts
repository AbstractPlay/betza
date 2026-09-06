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
    nonJumping: false,
    mustJump: 0,
    curved: false,
    zigzag: false,
    cylindrical: false,
    initialOnly: false,
    enPassantOnly: false,
    tame: false,

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

  it("expands C", () => {
    const a = expandAtom("C", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["C"]);
  });

  it("expands Z", () => {
    const a = expandAtom("Z", mods());
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["Z"]);
  });

  it("expands H (threeleaper)", () => {
    const a = expandAtom("H", mods());
    expect(a.kind).to.equal("leap");
    expect(a.maxSteps).to.equal(1);
    expect(a.deltasAbstract).to.deep.equal([
      [0, 3],
      [3, 0],
      [0, -3],
      [-3, 0],
    ]);
  });

  it("expands G (tripper)", () => {
    const a = expandAtom("G", mods());
    expect(a.kind).to.equal("leap");
    expect(a.deltasAbstract).to.deep.equal(DIRECTION_MAP["G"]);
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

  it("rejects blockable leap (n) on slides", () => {
    expect(() => expandAtom("R", mods({ nonJumping: true }))).to.throw(
      /blockable leap.*slide/,
    );
    expect(() => parseBetza("nR")).to.throw(/blockable leap.*slide/);
    expect(() => parseBetza("nN")).to.not.throw();
  });

  it("rejects blockable leap (n) on hoppers", () => {
    expect(() => expandAtom("W", mods({ nonJumping: true, hopStyle: "grasshopper", hopCount: 1 }))).to.throw(
      /blockable leap.*hop/,
    );
    expect(() => parseBetza("ngW")).to.throw(/blockable leap.*hop/);
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

  it("stops at enemy in one direction but moves in others", () => {
    const board = boardFromGrid([
      ".....",
      ".....",
      "..F..",
      "..E..",
      ".....",
    ]);

    const piece = new Piece("R", "R", squareCtx);
    const moves = generateMoves(piece, 2, 2, board);

    expect(moves).to.deep.include([2, 3]);
    expect(moves).to.deep.include([2, 1]);
    expect(moves).to.deep.include([1, 2]);
    expect(moves).to.deep.include([3, 2]);
    expect(moves).to.not.deep.include([2, 4]);
  });

  it("normal rook stops at first enemy per ray", () => {
    const board = boardFromGrid([
      ".....",
      "..E..",
      "..F..",
      "..E..",
      ".....",
    ]);

    const piece = new Piece("R", "R", squareCtx);
    const moves = generateMoves(piece, 2, 2, board);

    expect(moves).to.deep.include([2, 1]);
    expect(moves).to.deep.include([2, 3]);
    expect(moves).to.not.deep.include([2, 0]);
    expect(moves).to.not.deep.include([2, 4]);
  });

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

it("classifies slides: R B Q", () => {
  expect(classifyGeometry("R")).to.equal("slide");
  expect(classifyGeometry("B")).to.equal("slide");
  expect(classifyGeometry("Q")).to.equal("slide");
});

it("classifies steppers (W, F) as leaps", () => {
  expect(classifyGeometry("W")).to.equal("leap");
  expect(classifyGeometry("F")).to.equal("leap");
});

it("classifies leaps: N D A C Z G", () => {
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

it("classifies H (threeleaper) as a leap", () => {
  expect(classifyGeometry("H")).to.equal("leap");
});

  it("classifies hops: g h", () => {
    expect(classifyGeometry("g")).to.equal("hop");
    expect(classifyGeometry("h")).to.equal("hop");
  });

  it("lowercase unknown atoms classify as hop", () => {
    expect(classifyGeometry("q")).to.equal("hop");
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

  it("unknown symbols are not in DIRECTION_MAP", () => {
    expect("?" in DIRECTION_MAP).to.equal(false);
    expect(() => expandAtom("?", mods())).to.throw();
  });
});

describe("Betza/XBetza notation", () => {
  it("parses unions, numeric ranges, and old doubled riders", () => {
    expect(parseBetza("WFN")).to.have.length(3);
    for (const notation of ["N0", "NN"]) {
      const atom = parseBetza(notation)[0];
      expect(atom.kind).to.equal("slide");
      expect(atom.maxSteps).to.equal(Infinity);
    }
    expect(parseBetza("R3")[0].maxSteps).to.equal(3);
  });
  it("uses the standard G tripper atom", () => {
    expect(parseBetza("G")[0].deltasAbstract).to.have.deep.members([
      [3, 3], [3, -3], [-3, 3], [-3, -3],
    ]);
  });
  it("accepts explicit vector atoms", () => {
    const atom = parseBetza("(4,1)")[0];
    expect(atom.deltasAbstract).to.have.length(8);
    expect(atom.deltasAbstract).to.deep.include([4, 1]);
  });
  it("supports the universal leaper", () => {
    const board = boardFromGrid(["...", ".F.", "..."]);
    expect(generateMoves(new Piece("U", "U", squareCtx), 1, 1, board)).to.have.length(8);
  });
  it("implements the standard cannon p modifier", () => {
    const board = boardFromGrid([
      ".......", ".......", "...F...", "...F...", ".......", "...E...", ".......",
    ]);
    const captures = generateMoves(new Piece("cpR", "cpR", squareCtx), 3, 2, board);
    expect(captures).to.deep.equal([[3, 5]]);
    expect(generateMoves(new Piece("mRcpR", "mRcpR", squareCtx), 3, 2, board)).to.deep.include([3, 5]);
  });
  it("uses n for a lame leaper and j for must-jump", () => {
    const clear = boardFromGrid([".....", ".....", "..F..", ".....", "....."]);
    const blocked = boardFromGrid([".....", "..F..", "..F..", ".....", "....."]);
    expect(generateMoves(new Piece("nD", "nD", squareCtx), 2, 2, blocked)).to.not.deep.include([2, 0]);
    expect(generateMoves(new Piece("jD", "jD", squareCtx), 2, 2, blocked)).to.deep.include([2, 0]);
    expect(generateMoves(new Piece("jD", "jD", squareCtx), 2, 2, clear)).to.not.deep.include([2, 0]);
  });
  it("uses h as the standard half/chirality direction modifier", () => {
    const board = boardFromGrid([
      ".......", ".......", ".......", "...F...", ".......", ".......", ".......",
    ]);
    expect(generateMoves(new Piece("fhN", "fhN", squareCtx), 3, 3, board)).to.have.length(4);
    expect(generateMoves(new Piece("hrN", "hrN", squareCtx), 3, 3, board)).to.have.length(4);
    expect(generateMoves(new Piece("hlN", "hlN", squareCtx), 3, 3, board)).to.have.length(4);
  });
  it("supports zig-zag and curved riders", () => {
    const board = boardFromGrid([".....", ".....", "..F..", ".....", "....."]);
    expect(generateMoves(new Piece("zB", "zB", squareCtx), 2, 2, board)).to.deep.include([0, 2]);
    expect(generateMoves(new Piece("qR", "qR", squareCtx), 2, 2, board)).to.deep.include([3, 3]);
  });
  it("wraps files for the cylindrical o modifier", () => {
    const board = boardFromGrid(["F...."]);
    const moves = generateMoves(new Piece("oR2", "oR2", squareCtx), 0, 0, board);
    expect(moves).to.deep.include([4, 0]);
    expect(moves).to.deep.include([3, 0]);
  });
  it("wraps either board axis for every atom when the topology is cyclic", () => {
    const base = boardFromGrid(["F..", "...", "..."]);
    const board = {...base, get: base.get.bind(base), wrapRanks: true};
    const moves = generateMoves(new Piece("N", "N", squareCtx), 0, 0, board);
    expect(moves).to.deep.include.members([[1, 1], [2, 2]]);
  });
  it("supports XBetza a continuation legs", () => {
    const board = boardFromGrid([".....", ".....", "..F..", ".....", "....."]);
    const hook = generateMoves(new Piece("masR", "masR", squareCtx), 2, 2, board);
    expect(hook).to.deep.include([3, 3]);
    expect(hook).to.not.deep.include([4, 2]);
  });
  it("supports pass-through platforms on non-final legs", () => {
    const board = boardFromGrid([".....", "..F..", "..E..", ".....", "....."]);
    const moves = generateMoves(new Piece("pafR", "pafR", squareCtx), 2, 1, board);
    expect(moves).to.deep.include([2, 3]);
  });
  it("gates stateful i/e/t modifiers through board hooks", () => {
    const base = boardFromGrid(["...", ".F.", ".E."]);
    const board = {
      ...base,
      get: base.get.bind(base),
      isVirgin: () => true,
      isEnPassantTarget: (x: number, y: number) => x === 0 && y === 0,
      isRoyal: (x: number, y: number) => x === 1 && y === 2,
    };
    expect(generateMoves(new Piece("imW", "imW", squareCtx), 1, 1, board).length).to.be.greaterThan(0);
    expect(generateMoves(new Piece("tcR", "tcR", squareCtx), 1, 1, board)).to.deep.equal([]);
  });

  it("gates the universal leaper through the hooks", () => {
    const base = boardFromGrid(["...", ".F.", ".E."]);
    const unmoved = {
      ...base,
      get: base.get.bind(base),
      isVirgin: () => false,
      isRoyal: (x: number, y: number) => x === 1 && y === 2,
    };
    expect(generateMoves(new Piece("U", "U", squareCtx), 1, 1, unmoved)).to.have.length(8);
    expect(generateMoves(new Piece("iU", "iU", squareCtx), 1, 1, unmoved)).to.deep.equal([]);
    expect(generateMoves(new Piece("tU", "tU", squareCtx), 1, 1, unmoved)).to.not.deep.include([1, 2]);
  });
  it("rejects private legacy modifiers instead of silently misreading them", () => {
    for (const notation of ["xR", "uR", "yN"]) {
      expect(() => parseBetza(notation)).to.throw(/Expected a Betza atom/);
    }
    expect(() => parseBetza("O2")).to.throw(/castling atom/);
    expect(() => parseBetza("@")).to.throw(/drop atom/);
  });
});
