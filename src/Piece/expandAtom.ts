import type { Direction, MoveAtom } from "../types";
import { classifyGeometry, DIRECTION_MAP } from "../Geometry"; // you already have these

export function expandAtom(
  atom: string,
  mods: {
    moveOnly: boolean;
    captureOnly: boolean;
    hopCount: number;
    directionsRestricted: boolean;
    allowedDirections?: Direction[];

    requiresClearPath: boolean; // p
    againRider: boolean; // a
    hopStyle?: "cannon" | "grasshopper"; // g or h

    zigzag: boolean; // z
    takeAndContinue: boolean; // t
    unblockable: boolean; // u
    mustCaptureFirst: boolean; // o
    mustNotCaptureFirst: boolean; // x
    captureThenLeap: boolean; // y
  },
): MoveAtom {
  if (!(atom in DIRECTION_MAP)) {
    throw new Error(`Unknown Betza atom: ${atom}`);
  }

  //
  // ─────────────────────────────────────────────
  //   BASE MOVEATOM (all fields initialized)
  // ─────────────────────────────────────────────
  //
  const base: MoveAtom = {
    kind: classifyGeometry(atom),
    deltasAbstract: DIRECTION_MAP[atom] ?? [],
    maxSteps: classifyGeometry(atom) === "slide" ? Infinity : 1,

    hopCount: mods.hopCount,
    hopStyle: mods.hopStyle,

    moveOnly: mods.moveOnly,
    captureOnly: mods.captureOnly,

    directionsRestricted: mods.directionsRestricted,
    allowedDirections: mods.allowedDirections,

    requiresClearPath: mods.requiresClearPath,
    againRider: mods.againRider,

    zigzag: mods.zigzag,
    takeAndContinue: mods.takeAndContinue,
    unblockable: mods.unblockable,
    mustCaptureFirst: mods.mustCaptureFirst,
    mustNotCaptureFirst: mods.mustNotCaptureFirst,
    captureThenLeap: mods.captureThenLeap,
  };

  //
  // ─────────────────────────────────────────────
  //   APPLY MODIFIER SEMANTICS
  // ─────────────────────────────────────────────
  //

  // a = againRider → riderize leaper
  if (mods.againRider) {
    base.kind = "slide";
    base.maxSteps = Infinity;
  }

  // g/h = grasshopper/locust hop
  if (mods.hopStyle === "grasshopper") {
    base.kind = "hop";
    base.hopCount = 1;
    base.hopStyle = "grasshopper";
  }

  // y = capture-then-leap overrides o and x
  if (mods.captureThenLeap) {
    base.mustCaptureFirst = false;
    base.mustNotCaptureFirst = false;
  }

  return base;
}
