export {
  GeometryId,
  BoardCoordinate,
  GeometryContext,
  Geometry,
} from "./Geometry";
export { SquareRectGeometry } from "./SquareRectGeometry";
export { HexAxialGeometry } from "./HexAxialGeometry";

import type { Direction, MoveAtom } from "../types";
import { GeometryContext, Geometry } from "./Geometry";

export function classifyGeometry(symbol: string): "slide" | "leap" | "hop" {
  // Sliding pieces
  if (/^[RBQH]$/.test(symbol)) return "slide"; // ← H added here

  // Steppers (1‑square moves)
  if (/^[WF]$/.test(symbol)) return "leap";

  // Leapers
  if (/^[NDAECZGS]$/.test(symbol)) return "leap"; // H removed from this group

  // Hoppers
  if (/^[gh]$/.test(symbol)) return "hop";

  // Fallback: lowercase = hop, uppercase = leap
  if (symbol === symbol.toLowerCase()) return "hop";
  return "leap";
}

export function applyGeometry(
  atom: MoveAtom,
  geometry: Geometry,
  ctx: GeometryContext,
): MoveAtom {
  return {
    ...atom,
    deltasConcrete: atom.deltasAbstract.flatMap(([dx, dy]) =>
      geometry.interpretVector(dx, dy, ctx),
    ),
  };
}

export const DIRECTION_MAP: Record<string, Array<Direction>> = {
  // Slides
  R: [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ], // rook
  B: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ], // bishop
  Q: [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ],

  // Steps
  W: [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ], // wazir
  F: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ], // ferz

  // Leaps
  N: [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ], // knight
  D: [
    [0, 2],
    [2, 0],
    [0, -2],
    [-2, 0],
  ], // dabbaba
  A: [
    [2, 2],
    [2, -2],
    [-2, 2],
    [-2, -2],
  ], // alfil
  E: [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1], // elephant (ferz + dabbaba)
    [0, 2],
    [2, 0],
    [0, -2],
    [-2, 0],
  ],
  C: [
    [1, 3],
    [3, 1],
    [3, -1],
    [1, -3], // camel
    [-1, -3],
    [-3, -1],
    [-3, 1],
    [-1, 3],
  ],
  Z: [
    [2, 3],
    [3, 2],
    [3, -2],
    [2, -3], // zebra
    [-2, -3],
    [-3, -2],
    [-3, 2],
    [-2, 3],
  ],
  G: [
    [1, 4],
    [4, 1],
    [4, -1],
    [1, -4], // giraffe
    [-1, -4],
    [-4, -1],
    [-4, 1],
    [-1, 4],
  ],
  S: [
    [1, 1],
    [1, 2],
    [2, 1],
    [2, 2], // squirrel (standard fairy definition)
    [-1, 1],
    [-1, 2],
    [-2, 1],
    [-2, 2],
    [1, -1],
    [1, -2],
    [2, -1],
    [2, -2],
    [-1, -1],
    [-1, -2],
    [-2, -1],
    [-2, -2],
  ],

  // Pawn (forward-only step)
  P: [[0, 1]], // your tests expect this

  // Nightrider (slide‑knight)
  H: [
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2], // knight deltas
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ],
};
