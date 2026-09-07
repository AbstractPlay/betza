import { expect } from "chai";
import { classifyGeometry, DIRECTION_MAP } from "../src/Geometry";
import { expandAtom } from "../src/Piece/expandAtom";

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
describe("geometry – consistency", () => {

  it("every symbol in DIRECTION_MAP has a valid geometry classification", () => {
    for (const symbol of Object.keys(DIRECTION_MAP)) {
      const kind = classifyGeometry(symbol);

      expect(["slide", "leap", "hop"]).to.include(
        kind,
        `Symbol ${symbol} classified to invalid kind`
      );
    }
  });

  it("slide pieces have maxSteps = Infinity", () => {
    for (const symbol of Object.keys(DIRECTION_MAP)) {
      const kind = classifyGeometry(symbol);
      if (kind !== "slide") continue;

      const atom = expandAtom(symbol, mods());
      expect(atom.maxSteps).to.equal(
        Infinity,
        `Symbol ${symbol} classified as slide but maxSteps != Infinity`
      );
    }
  });

  it("leap pieces have maxSteps = 1", () => {
    for (const symbol of Object.keys(DIRECTION_MAP)) {
      const kind = classifyGeometry(symbol);
      if (kind !== "leap") continue;

      const atom = expandAtom(symbol, mods());
      expect(atom.maxSteps).to.equal(
        1,
        `Symbol ${symbol} classified as leap but maxSteps != 1`
      );
    }
  });

  it("hop pieces are never present in DIRECTION_MAP", () => {
    for (const symbol of Object.keys(DIRECTION_MAP)) {
      const kind = classifyGeometry(symbol);
      expect(kind).to.not.equal(
        "hop",
        `Symbol ${symbol} is in DIRECTION_MAP but classified as hop`
      );
    }
  });

  it("expandAtom throws for symbols not in DIRECTION_MAP", () => {
    const invalid = ["?", "!", "g", "h", "x", "foo"];

    for (const symbol of invalid) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => expandAtom(symbol as any, mods())).to.throw();
    }
  });
});
