import type { MoveAtom, BoardState, PathSquare } from "../types.js";
import { countPiecesOnLine } from "./utils.js";

export function generateSlideMoves(
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
  out: Array<[number, number]>,
) {
  if (!atom.deltasConcrete) return;
  if (atom.initialOnly && board.isVirgin?.(x, y) !== true) return;

  const deltas = atom.deltasConcrete;

  for (const { df, dr } of deltas) {
    const paths = atom.zigzag
      ? [
          buildZigzagRayDirection(atom, x, y, df, dr, 1, board),
          buildZigzagRayDirection(atom, x, y, df, dr, -1, board),
        ]
      : atom.curved
        ? [
            buildCurvedRayDirection(atom, x, y, df, dr, 1, board),
            buildCurvedRayDirection(atom, x, y, df, dr, -1, board),
          ]
      : [buildRayDirection(atom, x, y, df, dr, board)];

    for (const path of paths) {
      let annotated = annotateRay(path, board);

      if ((atom.mustJump ?? 0) > 0) annotated = annotated.slice(atom.mustJump);
      annotated = applyCannonRules(annotated, atom, x, y, board);

      const moves = emitMoves(annotated, atom, board);
      out.push(...moves);
    }
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
  turn: 1 | -1,
  board: BoardState,
): Array<[number, number]> {
  const ray: Array<[number, number]> = [];
  const visited = new Set<string>();
  const turnedDf = turn === 1 ? -startDr : startDr;
  const turnedDr = turn === 1 ? startDf : -startDf;
  let cx = x;
  let cy = y;
  let step = 1;
  const maxSteps = Number.isFinite(atom.maxSteps)
    ? atom.maxSteps
    : board.width + board.height;

  while (step <= maxSteps) {
    const straight = step % 2 === 1;
    cx += straight ? startDf : turnedDf;
    cy += straight ? startDr : turnedDr;

    const key = `${cx},${cy}`;
    const sq = board.get(cx, cy);
    if (!sq || visited.has(key)) break;

    visited.add(key);
    ray.push([cx, cy]);
    step++;
  }

  return ray;
}

function buildCurvedRayDirection(
  atom: MoveAtom, x: number, y: number, startDf: number, startDr: number,
  turn: 1 | -1, board: BoardState,
): Array<[number, number]> {
  const ray: Array<[number, number]> = [];
  const visited = new Set<string>();
  let df = startDf;
  let dr = startDr;
  let cx = x;
  let cy = y;
  const maxSteps = Number.isFinite(atom.maxSteps) ? atom.maxSteps : board.width * board.height;
  for (let step = 1; step <= maxSteps; step++) {
    cx += df; cy += dr;
    const key = `${cx},${cy}`;
    if (!board.get(cx, cy) || visited.has(key)) break;
    visited.add(key); ray.push([cx, cy]);
    [df, dr] = turn === 1 ? [-dr, df] : [dr, -df];
  }
  return ray;
}

function annotateRay(
  ray: Array<[number, number]>,
  board: BoardState,
): PathSquare[] {
  return ray.map(([x, y]) => ({ x, y, sq: board.get(x, y) }));
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

function emitMoves(
  path: PathSquare[],
  atom: MoveAtom,
  board: BoardState,
): Array<[number, number]> {
  const out: Array<[number, number]> = [];

  for (const sq of path) {
    if (!sq.sq) break;

    if (sq.sq.kind === "empty") {
      if ((!atom.captureOnly || atom.moveOnly) && (!atom.enPassantOnly || board.isEnPassantTarget?.(sq.x, sq.y) === true)) {
        out.push([sq.x, sq.y]);
      }
      continue;
    }

    if (sq.sq.kind === "enemy") {
      if ((!atom.moveOnly || atom.captureOnly) && (!atom.tame || board.isRoyal?.(sq.x, sq.y) !== true)) {
        out.push([sq.x, sq.y]);
      }

      break;
    }

    if (sq.sq.kind === "friendly") {
      break;
    }
  }

  return out;
}
