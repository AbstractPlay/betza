import { expect } from "chai";
import { HexAxialGeometry } from "../../src/Geometry";
import { hexCtx, expectCoord } from "./helpers";

describe("HexAxialGeometry", () => {
  describe("atomDeltas", () => {
    it("gives a wazir all six adjacent hexes", () => {
      const deltas = HexAxialGeometry.atomDeltas("W", [], hexCtx);
      expect(deltas).to.have.deep.members([
        {df: 1, dr: 0}, {df: 0, dr: 1}, {df: -1, dr: 1},
        {df: -1, dr: 0}, {df: 0, dr: -1}, {df: 1, dr: -1},
      ]);
    });

    it("rejects the universal leaper U", () => {
      expect(() => HexAxialGeometry.atomDeltas("U", [], hexCtx)).to.throw(
        /universal leaper 'U'/,
      );
    });
  });

  describe("applyDelta", () => {
    it("applies delta inside bounds", () => {
      const from = { file: 4, rank: 4 };
      const result = HexAxialGeometry.applyDelta(from, -1, 2, hexCtx);
      expectCoord(result, 3, 6);
    });

    it("returns null when off board", () => {
      const from = { file: 0, rank: 0 };
      const result = HexAxialGeometry.applyDelta(from, -1, 0, hexCtx);
      expect(result).to.equal(null);
    });
  });

});
