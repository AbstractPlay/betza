export {
  GeometryId,
  BoardCoordinate,
  GeometryContext,
  Geometry,
} from "./Geometry.js";
export { SquareRectGeometry } from "./SquareRectGeometry.js";
export { HexAxialGeometry } from "./HexAxialGeometry.js";

import type { Direction, MoveAtom, Side } from "../types.js";
import { GeometryContext, Geometry } from "./Geometry.js";

export function classifyGeometry(symbol: string): "slide" | "leap" | "hop" {
  if (symbol.startsWith("(")) return "leap";
  // Sliding pieces
  if (/^[RBQ]$/.test(symbol)) return "slide";

  // Steppers (1‑square moves)
  if (/^[WF]$/.test(symbol)) return "leap";

  // Leapers
  if (/^[NDACZGHU]$/.test(symbol)) return "leap";
  if (/^[KJL]$/.test(symbol)) return "leap";

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
  side: Side = "white",
): MoveAtom {
  const concrete = geometry.atomDeltas(atom.atom, atom.deltasAbstract, ctx);

  let selected = concrete;
  if (atom.directionalModifiers) {
    if (!geometry.selectDirections) {
      throw new Error(
        `The '${geometry.meta.id}' geometry does not support direction modifiers ('${atom.directionalModifiers}').`,
      );
    }
    selected = [
      ...geometry.selectDirections(concrete, atom.directionalModifiers),
    ];
  }

  return {
    ...atom,
    deltasConcrete:
      side === "white"
        ? selected
        : selected.map(({ df, dr }) => ({ df: -df, dr: -dr })),
  };
}

export const DIRECTION_MAP: Record<string, Array<Direction>> = {
  U: [], // universal leaper; expanded from board dimensions during generation
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
    [3, 3],
    [3, -3],
    [-3, 3],
    [-3, -3],
  ], // tripper
  H: [
    [0, 3],
    [3, 0],
    [0, -3],
    [-3, 0],
  ], // threeleaper
  // Derived standard shorthands and historical atom names
  K: [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ],
  J: [
    [1, 3], [3, 1], [3, -1], [1, -3],
    [-1, -3], [-3, -1], [-3, 1], [-1, 3],
  ],
  L: [
    [2, 3], [3, 2], [3, -2], [2, -3],
    [-2, -3], [-3, -2], [-3, 2], [-2, 3],
  ],
};
