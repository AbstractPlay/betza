export {
  GeometryId,
  BoardCoordinate,
  GeometryContext,
  Geometry,
} from "./Geometry";
export { SquareRectGeometry } from "./SquareRectGeometry";
export { HexAxialGeometry } from "./HexAxialGeometry";

import type { Direction, MoveAtom, Side } from "../types";
import { GeometryContext, Geometry } from "./Geometry";

export function classifyGeometry(symbol: string): "slide" | "leap" | "hop" {
  // Sliding pieces
  if (/^[RBQ]$/.test(symbol)) return "slide";

  // Steppers (1‑square moves)
  if (/^[WF]$/.test(symbol)) return "leap";

  // Leapers
  if (/^[NDAECZGHS]$/.test(symbol)) return "leap";
  if (/^[KMJ]$/.test(symbol)) return "leap";

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
  H: [
    [0, 3],
    [3, 0],
    [0, -3],
    [-3, 0],
  ], // threeleaper
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
  P: [[0, 1]],

  // Derived leapers
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
  M: [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ],
  J: [
    [0, 2],
    [2, 0],
    [0, -2],
    [-2, 0],
    [1, 2],
    [2, 1],
    [2, -1],
    [1, -2],
    [-1, -2],
    [-2, -1],
    [-2, 1],
    [-1, 2],
  ],
};
