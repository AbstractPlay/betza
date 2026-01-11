import type { Direction, MoveAtom } from "./types";
import {
  ORTHO, DIAG, KNIGHT, DABBABA, ALFIL, ELEPHANT,
  CAMEL, ZEBRA, WAZIR, FERZ, GIRAFFE, SQUIRREL, PAWN
} from "./types";

export function expandAtom(
  atom: string,
  mods: {
    moveOnly: boolean;
    captureOnly: boolean;
    hopCount: number;
    directionsRestricted: boolean;
    allowedDirections?: Direction[];

    requiresClearPath: boolean;   // p
    againRider: boolean;          // a
    hopStyle?: "cannon" | "grasshopper"; // j or g

    zigzag: boolean;              // z
    takeAndContinue: boolean;     // t
    unblockable: boolean;         // u
    mustCaptureFirst: boolean;    // o
    mustNotCaptureFirst: boolean; // x
    captureThenLeap: boolean;     // y
  }
): MoveAtom {

  // Base fields copied into every MoveAtom
  const base = {
    moveOnly: mods.moveOnly,
    captureOnly: mods.captureOnly,
    hopCount: mods.hopCount,
    directionsRestricted: mods.directionsRestricted,
    allowedDirections: mods.allowedDirections,

    requiresClearPath: mods.requiresClearPath,
    againRider: mods.againRider,
    hopStyle: mods.hopStyle,

    zigzag: mods.zigzag,
    takeAndContinue: mods.takeAndContinue,
    unblockable: mods.unblockable,
    mustCaptureFirst: mods.mustCaptureFirst,
    mustNotCaptureFirst: mods.mustNotCaptureFirst,
    captureThenLeap: mods.captureThenLeap
  };

  let result: MoveAtom;

  switch (atom) {
    case "W":
      result = { kind: "leap", deltas: WAZIR, maxSteps: 1, ...base };
      break;
    case "F":
      result = { kind: "leap", deltas: FERZ, maxSteps: 1, ...base };
      break;
    case "K":
      result = { kind: "leap", deltas: [...WAZIR, ...FERZ], maxSteps: 1, ...base };
      break;

    case "R":
      result = { kind: "slide", deltas: ORTHO, maxSteps: Infinity, ...base };
      break;
    case "B":
      result = { kind: "slide", deltas: DIAG, maxSteps: Infinity, ...base };
      break;
    case "Q":
      result = { kind: "slide", deltas: [...ORTHO, ...DIAG], maxSteps: Infinity, ...base };
      break;

    case "N":
      result = { kind: "leap", deltas: KNIGHT, maxSteps: 1, ...base };
      break;
    case "D":
      result = { kind: "leap", deltas: DABBABA, maxSteps: 1, ...base };
      break;
    case "A":
      result = { kind: "leap", deltas: ALFIL, maxSteps: 1, ...base };
      break;
    case "E":
      result = { kind: "leap", deltas: ELEPHANT, maxSteps: 1, ...base };
      break;
    case "C":
      result = { kind: "leap", deltas: CAMEL, maxSteps: 1, ...base };
      break;
    case "Z":
      result = { kind: "leap", deltas: ZEBRA, maxSteps: 1, ...base };
      break;

    case "H":
      result = { kind: "slide", deltas: KNIGHT, maxSteps: Infinity, ...base };
      break;
    case "G":
      result = { kind: "leap", deltas: GIRAFFE, maxSteps: 1, ...base };
      break;
    case "S":
      result = { kind: "leap", deltas: SQUIRREL, maxSteps: 1, ...base };
      break;

    case "P":
      result = { kind: "leap", deltas: PAWN, maxSteps: 1, ...base };
      break;

    default:
      throw new Error(`Unknown XBetza atom: ${atom}`);
  }

  //
  // ─────────────────────────────────────────────
  //   APPLY MODIFIER SEMANTICS
  // ─────────────────────────────────────────────
  //

  // a = againRider → riderize leaper
  if (mods.againRider) {
    result.kind = "slide";
    result.maxSteps = Infinity;
  }

  // g = grasshopper hop
  if (mods.hopStyle === "grasshopper") {
    result.kind = "hop";
    result.hopCount = 1;
    result.hopStyle = "grasshopper";
  }

  // y = capture-then-leap overrides o and x
  if (mods.captureThenLeap) {
    result.captureThenLeap = true;
    result.mustCaptureFirst = false;
    result.mustNotCaptureFirst = false;
  }

  return result;
}