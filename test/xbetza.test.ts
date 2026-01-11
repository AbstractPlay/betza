import "mocha";
import { expect } from "chai";
import { parseXBetza, expandAtom } from "../src";
import {
  ORTHO, DIAG, KNIGHT, DABBABA, ALFIL, ELEPHANT,
  CAMEL, ZEBRA, GIRAFFE, SQUIRREL, PAWN
} from "../src/types";

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
//   ATOM EXPANSION TESTS (ORIGINAL + NEW)
// ─────────────────────────────────────────────
//

describe("expandAtom – basic fairy atoms", () => {

  it("expands W (Wazir)", () => {
    const atom = expandAtom("W", mods());
    expect(atom.kind).to.equal("leap");
    expect(atom.deltas).to.deep.equal(ORTHO);
    expect(atom.maxSteps).to.equal(1);
  });

  it("expands F (Ferz)", () => {
    const atom = expandAtom("F", mods());
    expect(atom.kind).to.equal("leap");
    expect(atom.deltas).to.deep.equal(DIAG);
  });

  it("expands N (Knight)", () => {
    const atom = expandAtom("N", mods());
    expect(atom.deltas).to.deep.equal(KNIGHT);
  });

  it("expands D (Dabbaba)", () => {
    const atom = expandAtom("D", mods());
    expect(atom.deltas).to.deep.equal(DABBABA);
  });

  it("expands A (Alfil)", () => {
    const atom = expandAtom("A", mods());
    expect(atom.deltas).to.deep.equal(ALFIL);
  });

  it("expands E (Elephant)", () => {
    const atom = expandAtom("E", mods());
    expect(atom.deltas).to.deep.equal(ELEPHANT);
  });

  it("expands C (Camel)", () => {
    const atom = expandAtom("C", mods());
    expect(atom.deltas).to.deep.equal(CAMEL);
  });

  it("expands Z (Zebra)", () => {
    const atom = expandAtom("Z", mods());
    expect(atom.deltas).to.deep.equal(ZEBRA);
  });

  it("expands H (Nightrider)", () => {
    const atom = expandAtom("H", mods());
    expect(atom.kind).to.equal("slide");
    expect(atom.maxSteps).to.equal(Infinity);
    expect(atom.deltas).to.deep.equal(KNIGHT);
  });

  it("expands G (Giraffe)", () => {
    const atom = expandAtom("G", mods());
    expect(atom.deltas).to.deep.equal(GIRAFFE);
  });

  it("expands S (Squirrel)", () => {
    const atom = expandAtom("S", mods());
    expect(atom.deltas).to.deep.equal(SQUIRREL);
  });

  it("expands P (Pawn)", () => {
    const atom = expandAtom("P", mods());
    expect(atom.deltas).to.deep.equal(PAWN);
  });

  it("throws on unknown atom", () => {
    expect(() => expandAtom("?", mods())).to.throw();
  });
});

//
// ─────────────────────────────────────────────
//   MODIFIER TESTS (NEW)
// ─────────────────────────────────────────────
//

describe("expandAtom – modifier semantics", () => {

  it("applies againRider (a)", () => {
    const atom = expandAtom("N", mods({ againRider: true }));
    expect(atom.kind).to.equal("slide");
    expect(atom.maxSteps).to.equal(Infinity);
    expect(atom.againRider).to.equal(true);
  });

  it("applies requiresClearPath (p)", () => {
    const atom = expandAtom("A", mods({ requiresClearPath: true }));
    expect(atom.requiresClearPath).to.equal(true);
  });

  it("applies grasshopper hop (g)", () => {
    const atom = expandAtom("W", mods({ hopStyle: "grasshopper", hopCount: 1 }));
    expect(atom.kind).to.equal("hop");
    expect(atom.hopStyle).to.equal("grasshopper");
  });

  it("applies zigzag (z)", () => {
    const atom = expandAtom("F", mods({ zigzag: true }));
    expect(atom.zigzag).to.equal(true);
  });

  it("applies takeAndContinue (t)", () => {
    const atom = expandAtom("W", mods({ takeAndContinue: true }));
    expect(atom.takeAndContinue).to.equal(true);
  });

  it("applies unblockable (u)", () => {
    const atom = expandAtom("N", mods({ unblockable: true }));
    expect(atom.unblockable).to.equal(true);
  });

  it("applies mustCaptureFirst (o)", () => {
    const atom = expandAtom("F", mods({ mustCaptureFirst: true }));
    expect(atom.mustCaptureFirst).to.equal(true);
  });

  it("applies mustNotCaptureFirst (x)", () => {
    const atom = expandAtom("F", mods({ mustNotCaptureFirst: true }));
    expect(atom.mustNotCaptureFirst).to.equal(true);
  });

  it("applies captureThenLeap (y)", () => {
    const atom = expandAtom("N", mods({ captureThenLeap: true }));
    expect(atom.captureThenLeap).to.equal(true);
  });

  it("captureThenLeap overrides o and x", () => {
    const atom = expandAtom("N", mods({
      mustCaptureFirst: true,
      mustNotCaptureFirst: true,
      captureThenLeap: true
    }));

    expect(atom.captureThenLeap).to.equal(true);
    expect(atom.mustCaptureFirst).to.equal(false);
    expect(atom.mustNotCaptureFirst).to.equal(false);
  });
});

//
// ─────────────────────────────────────────────
//   PARSER TESTS (ORIGINAL + NEW)
// ─────────────────────────────────────────────
//

describe("parseXBetza – basic parsing", () => {

  it("parses a single atom", () => {
    const atoms = parseXBetza("N");
    expect(atoms.length).to.equal(1);
    expect(atoms[0].deltas).to.deep.equal(KNIGHT);
  });

  it("parses multiple atoms in sequence", () => {
    const atoms = parseXBetza("WFN");
    expect(atoms.length).to.equal(3);
    expect(atoms[0].deltas).to.deep.equal(ORTHO);
    expect(atoms[1].deltas).to.deep.equal(DIAG);
    expect(atoms[2].deltas).to.deep.equal(KNIGHT);
  });

  it("parses move-only modifier m", () => {
    const atoms = parseXBetza("mN");
    expect(atoms[0].moveOnly).to.equal(true);
  });

  it("parses capture-only modifier c", () => {
    const atoms = parseXBetza("cF");
    expect(atoms[0].captureOnly).to.equal(true);
  });

  it("parses hopper modifier j", () => {
    const atoms = parseXBetza("jN");
    expect(atoms[0].hopCount).to.equal(1);
    expect(atoms[0].hopStyle).to.equal("cannon");
  });

  it("parses grasshopper modifier g", () => {
    const atoms = parseXBetza("gW");
    expect(atoms[0].hopStyle).to.equal("grasshopper");
  });

  it("parses againRider modifier a", () => {
    const atoms = parseXBetza("aN");
    expect(atoms[0].againRider).to.equal(true);
  });

  it("parses requiresClearPath modifier p", () => {
    const atoms = parseXBetza("pA");
    expect(atoms[0].requiresClearPath).to.equal(true);
  });

  it("parses zigzag modifier z", () => {
    const atoms = parseXBetza("zF");
    expect(atoms[0].zigzag).to.equal(true);
  });

  it("parses takeAndContinue modifier t", () => {
    const atoms = parseXBetza("tW");
    expect(atoms[0].takeAndContinue).to.equal(true);
  });

  it("parses unblockable modifier u", () => {
    const atoms = parseXBetza("uN");
    expect(atoms[0].unblockable).to.equal(true);
  });

  it("parses mustCaptureFirst modifier o", () => {
    const atoms = parseXBetza("oF");
    expect(atoms[0].mustCaptureFirst).to.equal(true);
  });

  it("parses mustNotCaptureFirst modifier x", () => {
    const atoms = parseXBetza("xF");
    expect(atoms[0].mustNotCaptureFirst).to.equal(true);
  });

  it("parses captureThenLeap modifier y", () => {
    const atoms = parseXBetza("yN");
    expect(atoms[0].captureThenLeap).to.equal(true);
  });

  it("parses complex sequences with all modifiers", () => {
    const atoms = parseXBetza("mapztoxyuN");
    const a = atoms[0];

    expect(a.moveOnly).to.equal(true);
    expect(a.againRider).to.equal(true);
    expect(a.requiresClearPath).to.equal(true);
    expect(a.zigzag).to.equal(true);
    expect(a.takeAndContinue).to.equal(true);
    expect(a.unblockable).to.equal(true);

    // overridden by y
    expect(a.mustCaptureFirst).to.equal(false);
    expect(a.mustNotCaptureFirst).to.equal(false);

    expect(a.captureThenLeap).to.equal(true);
  });
});
