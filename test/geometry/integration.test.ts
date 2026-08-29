import { expect } from "chai";
import { expandAtom } from "../../src/Piece/expandAtom";
import { applyGeometry, SquareRectGeometry, HexAxialGeometry } from "../../src/Geometry";
import { generateMoves } from "../../src/generateMoves";
import { squareCtx, hexCtx } from "./helpers";
import { boardFromGrid } from "../helpers";

const modsNone = {
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
};

describe("Geometry Integration", () => {
    it("Knight on square board produces correct moves", () => {
        const atom = expandAtom("N", modsNone);
        const concrete = applyGeometry(atom, SquareRectGeometry, squareCtx);

        // 8×8 empty board
        const board = boardFromGrid([
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
            "........",
        ]);

        const moves = generateMoves(
            { atoms: [concrete] },
            4, 4,
            board
        );

        expect(moves).to.have.deep.members([
            [6, 5], [6, 3], [2, 5], [2, 3],
            [5, 6], [5, 2], [3, 6], [3, 2],
        ]);
    });

    it("Knight-like atom on hex board maps correctly", () => {
        const atom = expandAtom("N", modsNone);
        const concrete = applyGeometry(atom, HexAxialGeometry, hexCtx);

        // 20×20 empty hex board
        const board = boardFromGrid([
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
            "....................",
        ]);

        const moves = generateMoves(
            { atoms: [concrete] },
            4, 4,
            board
        );

        // Expected axial hex‑knight offsets
        const expected = [
            [5, 6], [6, 5], [7, 3], [7, 2], [6, 1], [5, 1],
            [3, 2], [2, 3], [1, 5], [1, 6], [2, 7], [3, 7],
        ];

        expect(moves).to.have.deep.members(expected);
    });
});
