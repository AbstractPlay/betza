export function leapPath(dx: number, dy: number): Array<[number, number]> {
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  const steps = Math.max(adx, ady);
  const straight = steps - Math.min(adx, ady);
  const path: Array<[number, number]> = [];
  let cx = 0;
  let cy = 0;
  for (let step = 0; step < steps; step++) {
    if (adx >= ady) {
      cx += sx;
      if (step >= straight) cy += sy;
    } else {
      cy += sy;
      if (step >= straight) cx += sx;
    }
    path.push([cx, cy]);
  }
  return path;
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

export function countPiecesOnLeapPath(
  x: number,
  y: number,
  tx: number,
  ty: number,
  board: { get(x: number, y: number): { kind: string } | undefined },
): number {
  const path = leapPath(tx - x, ty - y);
  let count = 0;
  for (const [dx, dy] of path.slice(0, -1)) {
    const sq = board.get(x + dx, y + dy);
    if (!sq) continue;
    if (sq.kind !== "empty") count++;
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
