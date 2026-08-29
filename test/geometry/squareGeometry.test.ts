import { expect } from "chai";
import { SquareRectGeometry } from "../../src/Geometry";
import { squareCtx, expectCoord } from "./helpers";

describe("SquareRectGeometry", () => {
  describe("atomDeltas", () => {
    it("keeps canonical square vectors unchanged", () => {
      const deltas = SquareRectGeometry.atomDeltas("N", [[2, -1]], squareCtx);
      expect(deltas).to.deep.equal([{ df: 2, dr: -1 }]);
    });
  });

  describe("applyDelta", () => {
    it("applies delta inside bounds", () => {
      const from = { file: 3, rank: 3 };
      const result = SquareRectGeometry.applyDelta(from, 1, -2, squareCtx);
      expectCoord(result, 4, 1);
    });

    it("returns null when off board", () => {
      const from = { file: 0, rank: 0 };
      const result = SquareRectGeometry.applyDelta(from, -1, 0, squareCtx);
      expect(result).to.equal(null);
    });
  });

});
