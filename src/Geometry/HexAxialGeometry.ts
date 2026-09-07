import { Geometry } from "./index.js";
import { selectByHalfPlanes } from "./directionModifiers.js";

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
      case "R":
      case "W":
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

  selectDirections: selectByHalfPlanes,
};
