import type { MoveAtom, BoardState, PathSquare } from "../types";
import { handleCaptureThenLeap } from ".";
import { countPiecesOnLine } from "./utils";

export function generateHopMoves(
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
  out: Array<[number, number]>,
) {
  if (!atom.deltasConcrete) return;

  const deltas = atom.deltasConcrete;

  for (const { df, dr } of deltas) {
    const ray = buildHopRayDirection(atom, x, y, df, dr, board);
    const annotated = annotateHopRay(ray, board);
    let landing = handleHopLogic(annotated, atom, board, df, dr);

    if (atom.hopStyle === "cannon" && atom.hopCount > 0) {
      landing = landing.filter(
        (sq) => countPiecesOnLine(x, y, sq.x, sq.y, board) === atom.hopCount,
      );
    }

    if (atom.requiresClearPath) {
      landing = landing.filter(
        (sq) => countPiecesOnLine(x, y, sq.x, sq.y, board) === 0,
      );
    }

    if (atom.captureThenLeap) {
      landing = handleCaptureThenLeap(landing, atom, board);
    }

    out.push(...emitHopMoves(landing));
  }
}

function buildHopRayDirection(
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

function annotateHopRay(
  ray: Array<[number, number]>,
  board: BoardState,
): PathSquare[] {
  return ray.map(([x, y]) => ({ x, y, sq: board.get(x, y) }));
}

function handleHopLogic(
  path: PathSquare[],
  atom: MoveAtom,
  board: BoardState,
  df: number,
  dr: number,
): PathSquare[] {
  if (atom.hopStyle === "locust") {
    const hurdle = path.find((sq) => sq.sq?.kind === "enemy");
    if (!hurdle) return [];

    const lx = hurdle.x + df;
    const ly = hurdle.y + dr;
    const landingSq = board.get(lx, ly);
    if (!landingSq) return [];
    if (landingSq.kind !== "empty") return [];
    if (atom.captureOnly) return [];
    return [{ x: lx, y: ly, sq: landingSq }];
  }

  const hurdle = path.find((sq) => sq.sq && sq.sq.kind !== "empty");
  if (!hurdle) return [];

  const lx = hurdle.x + df;
  const ly = hurdle.y + dr;
  const landingSq = board.get(lx, ly);
  if (!landingSq) return [];

  if (landingSq.kind === "friendly") return [];

  if (landingSq.kind === "empty") {
    if (atom.captureOnly) return [];
    return [{ x: lx, y: ly, sq: landingSq }];
  }

  if (landingSq.kind === "enemy") {
    if (atom.moveOnly) return [];
    return [{ x: lx, y: ly, sq: landingSq }];
  }

  return [];
}

function emitHopMoves(path: PathSquare[]): Array<[number, number]> {
  return path.map((sq) => [sq.x, sq.y]);
}
