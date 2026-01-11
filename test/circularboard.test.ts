import { expect } from "chai";
import { CircularBoard } from "../src/Board";

describe("CircularBoard", () => {

  describe("basic circular masking", () => {
    it("returns undefined for squares outside the circle", () => {
      const b = new CircularBoard(
        [
          ".....",
          ".....",
          "..F..",
          ".....",
          ".....",
        ],
        { radius: 1.5 } // only center + immediate neighbors
      );

      // Center is inside
      expect(b.get(2,2)?.kind).to.equal("friendly");

      // Corners are outside
      expect(b.get(0,0)).to.equal(undefined);
      expect(b.get(4,4)).to.equal(undefined);
      expect(b.get(0,4)).to.equal(undefined);
      expect(b.get(4,0)).to.equal(undefined);
    });

    it("allows access to all squares inside the circle", () => {
      const b = new CircularBoard(
        [
          ".....",
          ".....",
          "..F..",
          ".....",
          ".....",
        ],
        { radius: 3 }
      );

      expect(b.get(0,0)?.kind).to.equal("empty");
      expect(b.get(4,4)?.kind).to.equal("empty");
    });
  });

  describe("wrapX / wrapY", () => {
    it("wraps horizontally when wrapX=true", () => {
      const b = new CircularBoard(
        [
          ".....",
          "..F..",
          ".....",
        ],
        { wrapX: true, radius: 3 }
      );

      // (x = -1) wraps to x = 4
      expect(b.get(-1,1)?.kind).to.equal("empty");

      // (x = 5) wraps to x = 0
      expect(b.get(5,1)?.kind).to.equal("empty");
    });

    it("wraps vertically when wrapY=true", () => {
      const b = new CircularBoard(
        [
          "..F..",
          ".....",
          ".....",
        ],
        { wrapY: true, radius: 3 }
      );

      // (y = -1) wraps to y = 2
      expect(b.get(2,-1)?.kind).to.equal("empty");

      // (y = 3) wraps to y = 0
      expect(b.get(2,3)?.kind).to.equal("friendly");
    });

    it("wraps both axes independently", () => {
      const b = new CircularBoard(
        [
          "F....",
          ".....",
          ".....",
          ".....",
          "....E",
        ],
        { wrapX: true, wrapY: true, radius: 4 }
      );

      // (-1,-1) → wraps to (4,4) → enemy
      expect(b.get(-1,-1)?.kind).to.equal("enemy");

      // (5,5) → wraps to (0,0) → friendly
      expect(b.get(5,5)?.kind).to.equal("friendly");
    });
  });

  describe("set()", () => {
    it("converts string rows to object rows on first mutation", () => {
      const b = new CircularBoard(
        [
          ".....",
        ],
        { radius: 3 }
      );

      b.set(2,0,"F");

      const sq = b.get(2,0);
      expect(sq?.kind).to.equal("friendly");

      // row should now be an array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(Array.isArray((b as any).grid[0])).to.equal(true);
    });

    it("sets custom pieces correctly", () => {
      const b = new CircularBoard(
        [
          ".....",
        ],
        { radius: 3 }
      );

      b.set(4,0,{ piece: "wQ", kind: "friendly" });

      const sq = b.get(4,0);
      expect(sq?.kind).to.equal("friendly");
      expect(sq?.piece).to.equal("wQ");
    });

    it("does not set squares outside the circle", () => {
      const b = new CircularBoard(
        [
          ".....",
          ".....",
          ".....",
        ],
        { radius: 1.2 } // only center + immediate neighbors
      );

      // (0,0) is outside circle → ignored
      b.set(0,0,"F");
      expect(b.get(0,0)).to.equal(undefined);
    });

    it("respects wrapX/wrapY when setting", () => {
      const b = new CircularBoard(
        [
          ".....",
        ],
        { wrapX: true, radius: 3 }
      );

      // (-1,0) wraps to (4,0)
      b.set(-1,0,{ piece: "wR", kind: "friendly" });

      const sq = b.get(4,0);
      expect(sq?.kind).to.equal("friendly");
      expect(sq?.piece).to.equal("wR");
    });
  });

  describe("object row mode", () => {
    it("returns piece and kind from SquareState rows", () => {
      const b = new CircularBoard(
        [
          [
            { kind: "friendly", piece: "wK" },
            { kind: "enemy", piece: "bQ" },
          ],
        ],
        { radius: 10 }
      );

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
      const b = new CircularBoard(
        [
          "...",
          "...",
          "...",
        ],
        { radius: 3 }
      );

      expect(b.width).to.equal(3);
      expect(b.height).to.equal(3);
    });
  });

});
