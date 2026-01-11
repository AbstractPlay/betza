import type { MoveAtom, Direction } from "./types";
import { expandAtom } from "./expandAtom";

export function parseXBetza(x: string): MoveAtom[] {
  const atoms: MoveAtom[] = [];
  let i = 0;

  while (i < x.length) {
    let moveOnly = false;
    let captureOnly = false;
    let hopCount = 0;

    let directionsRestricted = false;
    let allowedDirections: Direction[] | undefined = undefined;

    let requiresClearPath = false;   // p
    let againRider = false;          // a
    let hopStyle: "cannon" | "grasshopper" | undefined = undefined;

    // NEW modifiers
    let zigzag = false;              // z
    let takeAndContinue = false;     // t
    let unblockable = false;         // u
    let mustCaptureFirst = false;    // o
    let mustNotCaptureFirst = false; // x
    let captureThenLeap = false;     // y

    //
    // ─────────────────────────────────────────────
    //   PREFIX MODIFIERS
    // ─────────────────────────────────────────────
    //
    while (i < x.length) {
      const c = x[i];

      // Basic
      if (c === "m") { moveOnly = true; i++; continue; }
      if (c === "c") { captureOnly = true; i++; continue; }

      // Hoppers
      if (c === "j") { hopCount++; hopStyle = "cannon"; i++; continue; }
      if (c === "g") { hopCount = 1; hopStyle = "grasshopper"; i++; continue; }

      // Path / rider modifiers
      if (c === "p") { requiresClearPath = true; i++; continue; }
      if (c === "a") { againRider = true; i++; continue; }

      // NEW modifiers
      if (c === "z") { zigzag = true; i++; continue; }
      if (c === "t") { takeAndContinue = true; i++; continue; }
      if (c === "u") { unblockable = true; i++; continue; }
      if (c === "o") { mustCaptureFirst = true; i++; continue; }
      if (c === "x") { mustNotCaptureFirst = true; i++; continue; }
      if (c === "y") { captureThenLeap = true; i++; continue; }

      // Directional
      if (c === "f") {
        directionsRestricted = true;
        allowedDirections = [[0,1], [1,1], [-1,1]];
        i++;
        continue;
      }
      if (c === "b") {
        directionsRestricted = true;
        allowedDirections = [[0,-1], [1,-1], [-1,-1]];
        i++;
        continue;
      }
      if (c === "l") {
        directionsRestricted = true;
        allowedDirections = [[-1,0], [-1,1], [-1,-1]];
        i++;
        continue;
      }
      if (c === "r") {
        directionsRestricted = true;
        allowedDirections = [[1,0], [1,1], [1,-1]];
        i++;
        continue;
      }

      break;
    }

    //
    // ─────────────────────────────────────────────
    //   ATOM CHARACTER
    // ─────────────────────────────────────────────
    //
    if (i >= x.length) {
      throw new Error("Unexpected end of XBetza string");
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
      captureThenLeap
    });

    atoms.push(atom);
  }

  return atoms;
}