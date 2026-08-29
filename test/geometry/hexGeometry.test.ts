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

  describe("resolveDirectionKeyword", () => {
    it("maps f/b/l/r correctly for axial", () => {
      expect(HexAxialGeometry.resolveDirectionKeyword("f", "white"))
        .to.deep.equal({ dx: 0, dy: 1 });

      expect(HexAxialGeometry.resolveDirectionKeyword("b", "white"))
        .to.deep.equal({ dx: 0, dy: -1 });

      expect(HexAxialGeometry.resolveDirectionKeyword("l", "white"))
        .to.deep.equal({ dx: -1, dy: 0 });

      expect(HexAxialGeometry.resolveDirectionKeyword("r", "white"))
        .to.deep.equal({ dx: 1, dy: 0 });
    });
  });
});
