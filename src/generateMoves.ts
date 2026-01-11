import type { BoardState, SquareState, MoveAtom } from "./types";

export function generateMoves(
  piece: { atoms: MoveAtom[] },
  x: number,
  y: number,
  board: BoardState
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

  return results;
}

function generateLeapMoves(
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
  out: Array<[number, number]>
) {
  for (const [dx, dy] of atom.deltas) {
    const nx = x + dx;
    const ny = y + dy;

    const sq = board.get(nx, ny);
    if (!sq) continue;

    // y = capture-then-leap (two-stage)
    if (atom.captureThenLeap) {
      if (sq.kind !== "enemy") continue;

      // second leap: same delta again
      const lx = nx + dx;
      const ly = ny + dy;
      const landing = board.get(lx, ly);
      if (!landing) continue;

      if (landing.kind === "empty") {
        out.push([lx, ly]);
      }
      continue;
    }

    // normal leap with o/x filtering
    if (canLand(atom, sq)) {
      out.push([nx, ny]);
    }
  }
}

function generateSlideMoves(
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
  out: Array<[number, number]>
) {
  for (const [dx, dy] of atom.deltas) {
    let steps = 1;
    let nx = x + dx;
    let ny = y + dy;

    let zig = false;

    while (steps <= atom.maxSteps) {
      const sq = board.get(nx, ny);
      if (!sq) break;

      // zig-zag alternation
      if (atom.zigzag) {
        zig = !zig;
        const [adx, ady] = zig ? atom.deltas[0] : atom.deltas[1];
        nx = x + adx * steps;
        ny = y + ady * steps;
      }

      // ───────────────────────────────────────────────
      // take-and-continue (t)
      // ───────────────────────────────────────────────
      if (atom.takeAndContinue) {
        if (sq.kind === "friendly") break;

        if (sq.kind === "enemy") {
          out.push([nx, ny]); // capture

          // continue sliding after capture
          nx += dx;
          ny += dy;
          steps++;
          continue;
        }

        // empty square BEFORE or AFTER capture is legal
        out.push([nx, ny]);

        nx += dx;
        ny += dy;
        steps++;
        continue;
      }

      // ───────────────────────────────────────────────
      // normal slide (no t)
      // ───────────────────────────────────────────────
      if (sq.kind === "empty") {
        if (!atom.captureOnly && !atom.mustCaptureFirst) {
          out.push([nx, ny]);
        }
      } else if (sq.kind === "enemy") {
        if (!atom.moveOnly && !atom.mustNotCaptureFirst) {
          out.push([nx, ny]);
        }
        break;
      } else {
        break; // friendly
      }

      nx += dx;
      ny += dy;
      steps++;
    }
  }
}

function generateHopMoves(
  atom: MoveAtom,
  x: number,
  y: number,
  board: BoardState,
  out: Array<[number, number]>
) {
  for (const [dx, dy] of atom.deltas) {
    let cx = x + dx;
    let cy = y + dy;

    let hops = 0;

    // find hop targets
    while (hops < atom.hopCount) {
      const sq = board.get(cx, cy);
      if (!sq) break;

      if (sq.kind !== "empty") hops++;

      cx += dx;
      cy += dy;
    }

    if (hops < atom.hopCount) continue;

    const landing = board.get(cx, cy);
    if (!landing) continue;

    // y = capture-then-leap
    if (atom.captureThenLeap) {
      if (landing.kind !== "enemy") continue;

      const lx = cx + dx;
      const ly = cy + dy;
      const sq2 = board.get(lx, ly);
      if (sq2 && sq2.kind === "empty") {
        out.push([lx, ly]);
      }
      continue;
    }

    // normal hop with o/x filtering
    if (canLand(atom, landing)) {
      out.push([cx, cy]);
    }
  }
}

function canLand(atom: MoveAtom, sq: SquareState): boolean {
  if (sq.kind === "empty") {
    if (atom.captureOnly) return false;
    if (atom.mustCaptureFirst) return false;
    return true;
  }

  if (sq.kind === "enemy") {
    if (atom.moveOnly) return false;
    if (atom.mustNotCaptureFirst) return false;
    return true;
  }

  return false; // friendly
}

