import type { MoveAtom } from "../types";
import { expandAtom } from "./expandAtom";

const DIRECTION_MODIFIERS = "fblrvs";

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

    let directionalModifiers = "";

    let requiresClearPath = false;
    let nonJumping = false;
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
      if (c === "n") {
        nonJumping = true;
        i++;
        continue;
      }
      if (c === "a") {
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

      if (DIRECTION_MODIFIERS.includes(c)) {
        directionalModifiers += c;
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

    let range: number | undefined;
    const digits = /^\d+/.exec(x.slice(i));
    if (digits !== null) {
      range = parseInt(digits[0], 10);
      if (range < 1) throw new Error(`A range of ${range} is not usable: ${x}`);
      i += digits[0].length;
    }

    const atom = expandAtom(atomChar, {
      moveOnly,
      captureOnly,
      hopCount,
      directionalModifiers: directionalModifiers || undefined,
      range,
      requiresClearPath,
      nonJumping,
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
