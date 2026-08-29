import type { MoveAtom, BoardState, PathSquare } from "../types";
import { handleCaptureThenLeap } from ".";
import { countPiecesOnLine } from "./utils";

export function generateSlideMoves(
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
  out: Array<[number, number]>,
) {
  if (!atom.deltasConcrete) return;

  const deltas = atom.deltasConcrete;

  for (const { df, dr } of deltas) {
    const path = atom.zigzag
      ? buildZigzagRayDirection(atom, x, y, df, dr, board)
      : buildRayDirection(atom, x, y, df, dr, board);
    let annotated = annotateRay(path, board);

    annotated = applyRequiresClearPath(annotated, atom);
    annotated = applyCannonRules(annotated, atom, x, y, board);
    annotated = applyCaptureRules(annotated, atom, board);

    if (atom.takeAndContinue) {
      annotated = handleTakeAndContinue(annotated);
    }

    const moves = emitMoves(annotated, atom);
    out.push(...moves);
  }
}

function buildRayDirection(
  atom: MoveAtom,
  x: number,
  y: number,
  df: number,
  dr: number,
  board: BoardState,
): Array<[number, number]> {
  const ray: Array<[number, number]> = [];
  let step = 1;

  while (step <= atom.maxSteps) {
    const nx = x + df * step;
    const ny = y + dr * step;

    if (!board.get(nx, ny)) break;

    ray.push([nx, ny]);
    step++;
  }

  return ray;
}

function buildZigzagRayDirection(
  atom: MoveAtom,
  x: number,
  y: number,
  startDf: number,
  startDr: number,
  board: BoardState,
): Array<[number, number]> {
  const ray: Array<[number, number]> = [];
  const visited = new Set<string>();
  let df = startDf;
  let dr = startDr;
  let cx = x;
  let cy = y;
  let step = 1;
  const maxSteps = Number.isFinite(atom.maxSteps)
    ? atom.maxSteps
    : board.width + board.height;

  while (step <= maxSteps) {
    cx += df;
    cy += dr;

    const key = `${cx},${cy}`;
    const sq = board.get(cx, cy);
    if (!sq || visited.has(key)) break;

    visited.add(key);
    ray.push([cx, cy]);
    [df, dr] = [-dr, df];
    step++;
  }

  return ray;
}

function annotateRay(
  ray: Array<[number, number]>,
  board: BoardState,
): PathSquare[] {
  return ray.map(([x, y]) => ({ x, y, sq: board.get(x, y) }));
}

function applyRequiresClearPath(
  path: PathSquare[],
  atom: MoveAtom,
): PathSquare[] {
  if (!atom.requiresClearPath) return path;

  const out: PathSquare[] = [];
  for (const sq of path) {
    if (!sq.sq || sq.sq.kind !== "empty") break;
    out.push(sq);
  }
  return out;
}

function applyCannonRules(
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

function applyCaptureRules(
  path: PathSquare[],
  atom: MoveAtom,
  board: BoardState,
): PathSquare[] {
  if (atom.captureThenLeap) {
    return handleCaptureThenLeap(path, atom, board);
  }
  if (atom.mustCaptureFirst) {
    return path.filter((s) => s.sq?.kind === "enemy");
  }
  if (atom.mustNotCaptureFirst) {
    return path.filter((s) => s.sq?.kind === "empty");
  }
  return path;
}

function handleTakeAndContinue(path: PathSquare[]): PathSquare[] {
  const out: PathSquare[] = [];

  for (const sq of path) {
    if (!sq.sq) break;
    if (sq.sq.kind === "friendly") break;

    out.push(sq);

    if (sq.sq.kind === "enemy") {
      continue;
    }
  }

  return out;
}

function emitMoves(
  path: PathSquare[],
  atom: MoveAtom,
): Array<[number, number]> {
  const out: Array<[number, number]> = [];

  for (const sq of path) {
    if (!sq.sq) break;

    if (sq.sq.kind === "empty") {
      if (!atom.captureOnly && !atom.mustCaptureFirst) {
        out.push([sq.x, sq.y]);
      }
      continue;
    }

    if (sq.sq.kind === "enemy") {
      if (!atom.moveOnly && !atom.mustNotCaptureFirst) {
        out.push([sq.x, sq.y]);
      }

      if (atom.takeAndContinue) {
        continue;
      }

      if (atom.unblockable) {
        continue;
      }

      break;
    }

    if (sq.sq.kind === "friendly") {
      if (atom.unblockable) {
        continue;
      }

      break;
    }
  }

  return out;
}
