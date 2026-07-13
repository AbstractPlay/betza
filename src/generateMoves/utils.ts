import type { Direction } from "../types";

export function filterDeltasByDirections(
  deltas: ReadonlyArray<{ df: number; dr: number }>,
  allowedDirections?: Direction[],
): Array<{ df: number; dr: number }> {
  if (!allowedDirections || allowedDirections.length === 0) {
    return [...deltas];
  }

  return deltas.filter(({ df, dr }) =>
    allowedDirections.some(
      ([adx, ady]) => adx * dr === ady * df && adx * df + ady * dr > 0,
    ),
  );
}

export function countPiecesOnLine(
  x: number,
  y: number,
  tx: number,
  ty: number,
  board: { get(x: number, y: number): { kind: string } | undefined },
): number {
  const dx = tx - x;
  const dy = ty - y;
  if (dx === 0 && dy === 0) return 0;

  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  const collinear =
    dx === 0 || dy === 0 || adx === ady;
  if (!collinear) return -1;

  const dfx = dx === 0 ? 0 : dx / adx;
  const dfy = dy === 0 ? 0 : dy / ady;

  let cx = x + dfx;
  let cy = y + dfy;
  let count = 0;

  while (cx !== tx || cy !== ty) {
    const sq = board.get(cx, cy);
    if (!sq) break;
    if (sq.kind !== "empty") count++;
    cx += dfx;
    cy += dfy;
  }

  return count;
}

export function dedupeMoves(
  moves: Array<[number, number]>,
): Array<[number, number]> {
  const seen = new Set<string>();
  const out: Array<[number, number]> = [];

  for (const [x, y] of moves) {
    const key = `${x},${y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([x, y]);
  }

  return out;
}
