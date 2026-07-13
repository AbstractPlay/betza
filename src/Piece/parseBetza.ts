import type { MoveAtom, Direction } from "../types";
import { expandAtom } from "./expandAtom";

const DIRECTION_SETS: Record<string, Direction[]> = {
  f: [
    [0, 1],
    [1, 1],
    [-1, 1],
  ],
  b: [
    [0, -1],
    [1, -1],
    [-1, -1],
  ],
  l: [
    [-1, 0],
    [-1, 1],
    [-1, -1],
  ],
  r: [
    [1, 0],
    [1, 1],
    [1, -1],
  ],
};

function mergeDirections(
  existing: Direction[] | undefined,
  next: Direction[],
): Direction[] {
  const seen = new Set<string>();
  const merged: Direction[] = [];

  for (const dirs of [existing ?? [], next]) {
    for (const d of dirs) {
      const key = `${d[0]},${d[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(d);
    }
  }

  return merged;
}

export function parseBetza(x: string): MoveAtom[] {
  if (x.length === 0) {
    throw new Error("Empty Betza string");
  }

  const atoms: MoveAtom[] = [];
  let i = 0;

  while (i < x.length) {
    let moveOnly = false;
    let captureOnly = false;
    let hopCount = 0;

    let directionsRestricted = false;
    let allowedDirections: Direction[] | undefined = undefined;

    let requiresClearPath = false;
    let againRider = false;
    let hopStyle: "cannon" | "grasshopper" | "locust" | undefined = undefined;

    let zigzag = false;
    let takeAndContinue = false;
    let unblockable = false;
    let mustCaptureFirst = false;
    let mustNotCaptureFirst = false;
    let captureThenLeap = false;

    while (i < x.length) {
      const c = x[i];

      if (c === "m") {
        moveOnly = true;
        i++;
        continue;
      }
      if (c === "c") {
        captureOnly = true;
        i++;
        continue;
      }

      if (c === "j") {
        hopCount++;
        hopStyle = "cannon";
        i++;
        continue;
      }
      if (c === "g") {
        hopCount = 1;
        hopStyle = "grasshopper";
        i++;
        continue;
      }
      if (c === "h") {
        hopCount = 1;
        hopStyle = "locust";
        i++;
        continue;
      }

      if (c === "p") {
        requiresClearPath = true;
        i++;
        continue;
      }
      if (c === "a" || c === "s") {
        againRider = true;
        i++;
        continue;
      }

      if (c === "z") {
        zigzag = true;
        i++;
        continue;
      }
      if (c === "t") {
        takeAndContinue = true;
        i++;
        continue;
      }
      if (c === "u") {
        unblockable = true;
        i++;
        continue;
      }
      if (c === "o") {
        mustCaptureFirst = true;
        i++;
        continue;
      }
      if (c === "x") {
        mustNotCaptureFirst = true;
        i++;
        continue;
      }
      if (c === "y") {
        captureThenLeap = true;
        i++;
        continue;
      }

      if (c in DIRECTION_SETS) {
        directionsRestricted = true;
        allowedDirections = mergeDirections(
          allowedDirections,
          DIRECTION_SETS[c],
        );
        i++;
        continue;
      }

      break;
    }

    if (i >= x.length) {
      throw new Error("Unexpected end of Betza string");
    }

    const atomChar = x[i];
    i++;

    const atom = expandAtom(atomChar, {
      moveOnly,
      captureOnly,
      hopCount,
      directionsRestricted,
      allowedDirections,
      requiresClearPath,
      againRider,
      hopStyle,

      zigzag,
      takeAndContinue,
      unblockable,
      mustCaptureFirst,
      mustNotCaptureFirst,
      captureThenLeap,
    });

    atoms.push(atom);
  }

  return atoms;
}
