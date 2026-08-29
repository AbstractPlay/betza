import type { MoveAtom, BoardState, PathSquare } from "../types";
import { handleCaptureThenLeap } from ".";
import { generateSlideMoves } from "./generateSlideMoves";
import { countPiecesOnLeapPath, countPiecesOnLine } from "./utils";

export function generateLeapMoves(
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
  out: Array<[number, number]>,
) {
  if (!atom.deltasConcrete) return;

  const deltas = atom.deltasConcrete;

  const targets = deltas.map(({ df, dr }) => [x + df, y + dr] as [number, number]);
  let annotated = annotateLeapTargets(targets, board);
  annotated = applyLeapCannon(annotated, atom, x, y, board);
  annotated = applyLeapClearPath(annotated, atom, x, y, board);
  annotated = applyLeapModifiers(annotated, atom, board);

  for (const sq of annotated) {
    out.push([sq.x, sq.y]);

    if (atom.takeAndContinue && sq.sq?.kind === "enemy") {
      const slideAtom: MoveAtom = {
        ...atom,
        kind: "slide",
        maxSteps: Infinity,
        takeAndContinue: true,
        captureThenLeap: false,
        mustCaptureFirst: false,
        mustNotCaptureFirst: false,
        deltasConcrete: deltas,
      };
      generateSlideMoves(slideAtom, sq.x, sq.y, board, out);
    }
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
  if (!atom.requiresClearPath) return path;

  return path.filter((sq) => countPiecesOnLine(x, y, sq.x, sq.y, board) === 0);
}

function applyLeapModifiers(
  path: PathSquare[],
  atom: MoveAtom,
  board: BoardState,
): PathSquare[] {
  if (atom.captureThenLeap) {
    return handleCaptureThenLeap(path, atom, board);
  }

  return path.filter((sq) => {
    if (!sq.sq) return false;

    if (sq.sq.kind === "friendly" && !atom.unblockable) return false;
    if (sq.sq.kind === "friendly" && atom.unblockable) return false;

    if (sq.sq.kind === "empty") {
      if (atom.captureOnly) return false;
      if (atom.mustCaptureFirst) return false;
      return true;
    }

    if (sq.sq.kind === "enemy") {
      if (atom.moveOnly) return false;
      if (atom.mustNotCaptureFirst) return false;
      return true;
    }

    return false;
  });
}
