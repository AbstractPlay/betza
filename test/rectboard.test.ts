import { expect } from "chai";
import { RectBoard } from "../src/Board";

describe("RectBoard", () => {

  describe("basic get()", () => {
    it("returns empty/friendly/enemy for string rows", () => {
      const b = new RectBoard([
        "...",
        ".F.",
        ".E.",
      ]);

      expect(b.get(0,0)?.kind).to.equal("empty");
      expect(b.get(1,1)?.kind).to.equal("friendly");
      expect(b.get(1,2)?.kind).to.equal("enemy");

      // piece should be optional/unused in plain string mode
      expect(b.get(1,1)?.piece).to.equal(undefined);
      expect(b.get(1,2)?.piece).to.equal(undefined);
    });

    it("returns undefined for out-of-bounds when wrap disabled", () => {
      const b = new RectBoard(["..."]);
      expect(b.get(-1,0)).to.equal(undefined);
      expect(b.get(3,0)).to.equal(undefined);
      expect(b.get(0,-1)).to.equal(undefined);
      expect(b.get(0,1)).to.equal(undefined);
    });
  });

  describe("wrapX / wrapY", () => {
    it("wraps horizontally when wrapX=true", () => {
      const b = new RectBoard(
        ["F.."],
        { wrapX: true }
      );

      expect(b.get(-1,0)?.kind).to.equal("empty");    // wraps to x=2
      expect(b.get(3,0)?.kind).to.equal("friendly");  // wraps to x=0
    });

    it("wraps vertically when wrapY=true", () => {
      const b = new RectBoard(
        [
          ".",
          "F",
          "E",
        ],
        { wrapY: true }
      );

      expect(b.get(0,-1)?.kind).to.equal("enemy");   // wraps to y=2
      expect(b.get(0,3)?.kind).to.equal("empty");    // wraps to y=0
    });

    it("wraps both axes independently", () => {
      const b = new RectBoard(
        [
          "F.",
          ".E",
        ],
        { wrapX: true, wrapY: true }
      );

      expect(b.get(-1,-1)?.kind).to.equal("enemy");    // wraps to (1,1)
      expect(b.get(2,2)?.kind).to.equal("friendly");   // wraps to (0,0)
    });
  });

  describe("set()", () => {
    it("mutates string rows by converting them to object rows", () => {
      const b = new RectBoard([
        "...",
      ]);

      b.set(1,0,"F");

      const sq = b.get(1,0);
      expect(sq?.kind).to.equal("friendly");

      // After conversion we still don't rely on piece for meaning
      // (it may be undefined or some internal placeholder)
      // So we don't assert sq.piece here.

      // row should now be an array, not a string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(Array.isArray((b as any).grid[0])).to.equal(true);
    });

    it("sets custom pieces correctly", () => {
      const b = new RectBoard([
        "...",
      ]);

      b.set(2,0,{ piece: "wQ", kind: "friendly" });

      const sq = b.get(2,0);
      expect(sq?.kind).to.equal("friendly");
      expect(sq?.piece).to.equal("wQ");
    });

    it("respects wrapX/wrapY when setting", () => {
      const b = new RectBoard(
        ["..."],
        { wrapX: true }
      );

      b.set(-1,0,{ piece: "wR", kind: "friendly" }); // wraps to x=2

      const sq = b.get(2,0);
      expect(sq?.kind).to.equal("friendly");
      expect(sq?.piece).to.equal("wR");
    });
  });

  describe("object row mode", () => {
    it("returns piece and kind from SquareState rows", () => {
      const b = new RectBoard([
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

  describe("width() and height()", () => {
    it("returns correct dimensions for string rows", () => {
      const b = new RectBoard([
        "...",
        "...",
      ]);

      expect(b.width).to.equal(3);
      expect(b.height).to.equal(2);
    });

    it("returns correct dimensions for object rows", () => {
      const b = new RectBoard([
        [
          { kind: "empty" },
          { kind: "friendly", piece: "F" },
        ],
        [
          { kind: "enemy", piece: "E" },
          { kind: "empty" },
        ]
      ]);

      expect(b.width).to.equal(2);
      expect(b.height).to.equal(2);
    });
  });

});
