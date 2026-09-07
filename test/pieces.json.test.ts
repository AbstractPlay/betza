import "mocha";
import { expect } from "chai";
import { readFileSync } from "fs";
import { join } from "path";
import { Piece } from "../src/Piece";
import { generateMoves } from "../src/generateMoves";
import { RectBoard } from "../src/Board";
import { parseBetza } from "../src/Piece/parseBetza";

const piecesJson = JSON.parse(
  readFileSync(join(__dirname, "../doc/pieces.json"), "utf8"),
) as { pieces: Array<{ id: string; betza: string }> };

const emptyBoard8 = new RectBoard([
  "........",
  "........",
  "........",
  "........",
  "....F...",
  "........",
  "........",
  "........",
]);

describe("doc/pieces.json", () => {
  for (const entry of piecesJson.pieces) {
    it(`${entry.id} (${entry.betza}) parses`, () => {
      expect(() => parseBetza(entry.betza)).to.not.throw();
    });

    it(`${entry.id} (${entry.betza}) generates moves from center`, () => {
      const piece = new Piece(entry.id, entry.betza, emptyBoard8.geometryContext);
      const moves = generateMoves(piece, 4, 4, emptyBoard8);
      // Grasshopper atoms need a hurdle; cannons paired with m-slides still move.
      const needsHurdle = /^g/.test(entry.betza);
      if (needsHurdle) {
        expect(moves).to.be.an("array");
      } else {
        expect(moves.length).to.be.greaterThan(0);
      }
    });
  }
});
