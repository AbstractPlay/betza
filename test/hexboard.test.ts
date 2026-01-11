import { expect } from "chai";
import { HexBoard } from "../src/Board";

describe("HexBoard", () => {

  describe("basic get()", () => {
    it("returns empty/friendly/enemy for string rows", () => {
      const b = new HexBoard([
        "..F..",
        ".....",
        "..E..",
      ]);

      expect(b.get(2,0)?.kind).to.equal("friendly");
      expect(b.get(2,2)?.kind).to.equal("enemy");
      expect(b.get(0,0)?.kind).to.equal("empty");
    });

    it("returns undefined for out-of-bounds when wrap disabled", () => {
      const b = new HexBoard(["..."]);

      expect(b.get(-1,0)).to.equal(undefined);
      expect(b.get(3,0)).to.equal(undefined);
      expect(b.get(0,-1)).to.equal(undefined);
      expect(b.get(0,1)).to.equal(undefined);
    });
  });

  describe("wrapQ / wrapR", () => {
    it("wraps horizontally when wrapQ=true", () => {
      const b = new HexBoard(
        ["F.."],
        { wrapQ: true }
      );

      // q = -1 wraps to q = 2
      expect(b.get(-1,0)?.kind).to.equal("empty");

      // q = 3 wraps to q = 0
      expect(b.get(3,0)?.kind).to.equal("friendly");
    });

    it("wraps vertically when wrapR=true", () => {
      const b = new HexBoard(
        [
          "..F..",
          ".....",
          ".....",
        ],
        { wrapR: true }
      );

      // r = -1 wraps to r = 2
      expect(b.get(2,-1)?.kind).to.equal("empty");

      // r = 3 wraps to r = 0
      expect(b.get(2,3)?.kind).to.equal("friendly");
    });

    it("wraps both axes independently", () => {
      const b = new HexBoard(
        [
          "F....",
          ".....",
          ".....",
          ".....",
          "....E",
        ],
        { wrapQ: true, wrapR: true }
      );

      // (-1,-1) → wraps to (4,4) → enemy
      expect(b.get(-1,-1)?.kind).to.equal("enemy");

      // (5,5) → wraps to (0,0) → friendly
      expect(b.get(5,5)?.kind).to.equal("friendly");
    });
  });

  describe("set()", () => {
    it("sets simple values correctly", () => {
      const b = new HexBoard(["....."]);

      b.set(2,0,"F");
      expect(b.get(2,0)?.kind).to.equal("friendly");

      b.set(3,0,"E");
      expect(b.get(3,0)?.kind).to.equal("enemy");

      b.set(1,0,".");
      expect(b.get(1,0)?.kind).to.equal("empty");
    });

    it("sets custom pieces correctly", () => {
      const b = new HexBoard(["....."]);

      b.set(4,0,{ piece: "wQ", kind: "friendly" });

      const sq = b.get(4,0);
      expect(sq?.kind).to.equal("friendly");
      expect(sq?.piece).to.equal("wQ");
    });

    it("respects wrapQ/wrapR when setting", () => {
      const b = new HexBoard(
        ["....."],
        { wrapQ: true }
      );

      // q = -1 wraps to q = 4
      b.set(-1,0,{ piece: "wR", kind: "friendly" });

      const sq = b.get(4,0);
      expect(sq?.kind).to.equal("friendly");
      expect(sq?.piece).to.equal("wR");
    });
  });

  describe("object row mode", () => {
    it("returns piece and kind from SquareState rows", () => {
      const b = new HexBoard([
        [
          { kind: "friendly", piece: "wK" },
          { kind: "enemy", piece: "bQ" },
        ],
      ]);

      const k = b.get(0,0);
      const q = b.get(1,0);

      expect(k?.kind).to.equal("friendly");
      expect(k?.piece).to.equal("wK");

      expect(q?.kind).to.equal("enemy");
      expect(q?.piece).to.equal("bQ");
    });
  });

  describe("dimensions", () => {
    it("returns correct width and height", () => {
      const b = new HexBoard(
        [
          "...",
          "...",
          "...",
        ]
      );

      expect(b.width).to.equal(3);
      expect(b.height).to.equal(3);
    });
  });

});
