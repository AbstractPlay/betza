import { generateHopMoves } from "./generateHopMoves.js";
import { generateLeapMoves } from "./generateLeapMoves.js";
import { generateSlideMoves } from "./generateSlideMoves.js";
import { dedupeMoves } from "./utils.js";

import type { MoveAtom, BoardState, PathSquare } from "../types.js";

export function generateMoves(
  piece: { atoms: readonly MoveAtom[] },
  x: number,
  y: number,
  board: BoardState,
): Array<[number, number]> {
  const results: Array<[number, number]> = [];

  for (const atom of piece.atoms) {
    switch (atom.kind) {
      case "leap":
        generateLeapMoves(atom, x, y, board, results);
        break;

      case "slide":
        generateSlideMoves(atom, x, y, board, results);
        break;

      case "hop":
        generateHopMoves(atom, x, y, board, results);
        break;
    }
  }

  return dedupeMoves(results);
}

export function handleCaptureThenLeap(
  path: PathSquare[],
  atom: MoveAtom,
  board: BoardState,
): PathSquare[] {
  if (!atom.deltasConcrete) return [];

  const capture = path.find((sq) => sq.sq?.kind === "enemy");
  if (!capture) return [];

  const results: PathSquare[] = [];

  for (const { df, dr } of atom.deltasConcrete) {
    const nx = capture.x + df;
    const ny = capture.y + dr;

    const sq = board.get(nx, ny);
    if (!sq) continue;

    if (sq.kind === "empty" && !atom.captureOnly) {
      results.push({ x: nx, y: ny, sq });
    }

    if (sq.kind === "enemy" && !atom.moveOnly) {
      results.push({ x: nx, y: ny, sq });
    }
  }

  return results;
}
