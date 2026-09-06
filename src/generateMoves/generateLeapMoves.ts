import type { MoveAtom, BoardState, PathSquare } from "../types.js";
import { countPiecesOnLeapPath, countPiecesOnLine } from "./utils.js";

export function generateLeapMoves(
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
  out: Array<[number, number]>,
) {
  if (!atom.deltasConcrete) return;
  if (atom.initialOnly && board.isVirgin?.(x, y) !== true) return;

  const deltas = atom.deltasConcrete;

  const targets = deltas.map(({ df, dr }) => [x + df, y + dr] as [number, number]);
  let annotated = annotateLeapTargets(targets, board);
  annotated = applyLeapCannon(annotated, atom, x, y, board);
  annotated = applyLeapClearPath(annotated, atom, x, y, board);
  annotated = applyLeapModifiers(annotated, atom, board);

  for (const sq of annotated) {
    out.push([sq.x, sq.y]);
  }
}

function annotateLeapTargets(
  targets: Array<[number, number]>,
  board: BoardState,
): PathSquare[] {
  return targets.map(([x, y]) => ({ x, y, sq: board.get(x, y) }));
}

function applyLeapCannon(
  path: PathSquare[],
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
): PathSquare[] {
  if (atom.hopStyle !== "cannon" || atom.hopCount <= 0) return path;

  return path.filter((sq) => {
    const hurdles = countPiecesOnLine(x, y, sq.x, sq.y, board);
    return hurdles === atom.hopCount;
  });
}

function applyLeapClearPath(
  path: PathSquare[],
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
): PathSquare[] {
  if (atom.nonJumping) {
    return path.filter(
      (sq) => countPiecesOnLeapPath(x, y, sq.x, sq.y, board) === 0,
    );
  }
  if ((atom.mustJump ?? 0) > 0) {
    return path.filter(sq => countPiecesOnLeapPath(x, y, sq.x, sq.y, board) >= atom.mustJump!);
  }
  return path;
}

function applyLeapModifiers(
  path: PathSquare[],
  atom: MoveAtom,
  board: BoardState,
): PathSquare[] {
  return path.filter((sq) => {
    if (!sq.sq) return false;

    if (sq.sq.kind === "friendly") return false;

    if (sq.sq.kind === "empty") {
      if (atom.captureOnly && !atom.moveOnly) return false;
      if (atom.enPassantOnly && board.isEnPassantTarget?.(sq.x, sq.y) !== true) return false;
      return true;
    }

    if (sq.sq.kind === "enemy") {
      if (atom.moveOnly && !atom.captureOnly) return false;
      if (atom.tame && board.isRoyal?.(sq.x, sq.y) === true) return false;
      return true;
    }

    return false;
  });
}
