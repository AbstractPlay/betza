import { Geometry } from ".";
export const HexAxialGeometry: Geometry = {
  meta: { id: "hex-axial", version: "1.0.0" },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interpretVector(dx, dy, ctx) {
    // Example: treat (dx, dy) as axial (q, r)
    // You might later support keyword-based directions and map them here.
    return [{ df: dx, dr: dy }];
  },

  applyDelta(from, df, dr, ctx) {
    // Here file = q, rank = r in axial coords.
    const q = from.file + df;
    const r = from.rank + dr;

    // Bounds are game-specific; simple rectangle for now:
    if (q < 0 || q >= ctx.boardWidth || r < 0 || r >= ctx.boardHeight) {
      return null;
    }
    return { file: q, rank: r };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolveDirectionKeyword(keyword, sideToMove) {
    // Example mapping for hex (axial): adjust to your convention
    switch (keyword) {
      case "f":
        return { dx: 0, dy: 1 };
      case "b":
        return { dx: 0, dy: -1 };
      case "l":
        return { dx: -1, dy: 0 };
      case "r":
        return { dx: 1, dy: 0 };
      // others as needed

      default:
        throw new Error(`Unhandled direction keyword: ${keyword}`);
    }
  },
};
