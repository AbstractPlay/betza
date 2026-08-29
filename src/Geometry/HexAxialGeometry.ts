import { Geometry } from ".";

type Delta = { df: number; dr: number };

const rook: readonly Delta[] = [
  { df: 1, dr: 0 },
  { df: 0, dr: 1 },
  { df: -1, dr: 1 },
  { df: -1, dr: 0 },
  { df: 0, dr: -1 },
  { df: 1, dr: -1 },
];
const bishop: readonly Delta[] = [
  { df: 1, dr: 1 },
  { df: -1, dr: 2 },
  { df: -2, dr: 1 },
  { df: -1, dr: -1 },
  { df: 1, dr: -2 },
  { df: 2, dr: -1 },
];
const knight: readonly Delta[] = [
  { df: 1, dr: 2 },
  { df: 2, dr: 1 },
  { df: 3, dr: -1 },
  { df: 3, dr: -2 },
  { df: 2, dr: -3 },
  { df: 1, dr: -3 },
  { df: -1, dr: -2 },
  { df: -2, dr: -1 },
  { df: -3, dr: 1 },
  { df: -3, dr: 2 },
  { df: -2, dr: 3 },
  { df: -1, dr: 3 },
];
const scale = (deltas: readonly Delta[], by: number): Delta[] =>
  deltas.map(({ df, dr }) => ({ df: df * by, dr: dr * by }));

export const HexAxialGeometry: Geometry = {
  meta: { id: "hex-axial", version: "1.0.0" },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  atomDeltas(atom, canonical, ctx) {
    switch (atom) {
      case "P":
        return [{ df: 0, dr: 1 }];
      case "R":
      case "W":
      case "M":
        return rook;
      case "B":
      case "F":
        return bishop;
      case "Q":
      case "K":
        return [...rook, ...bishop];
      case "N":
        return knight;
      case "D":
        return scale(rook, 2);
      case "A":
        return scale(bishop, 2);
      case "H":
        return scale(rook, 3);
      case "E":
        return [...bishop, ...scale(rook, 2)];
      case "J":
        return [...scale(rook, 2), ...knight];
      default:
        throw new Error(
          `The '${atom}' Betza atom is not defined for axial hex geometry.`,
        );
    }
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
