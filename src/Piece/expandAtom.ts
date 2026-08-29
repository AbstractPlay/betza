import type { MoveAtom } from "../types";
import { classifyGeometry, DIRECTION_MAP } from "../Geometry";

export function expandAtom(
  atom: string,
  mods: {
    moveOnly: boolean;
    captureOnly: boolean;
    hopCount: number;
    directionalModifiers?: string;
    range?: number;

    requiresClearPath: boolean;
    nonJumping?: boolean;
    againRider: boolean;
    hopStyle?: "cannon" | "grasshopper" | "locust";

    zigzag: boolean;
    takeAndContinue: boolean;
    unblockable: boolean;
    mustCaptureFirst: boolean;
    mustNotCaptureFirst: boolean;
    captureThenLeap: boolean;
  },
): MoveAtom {
  if (!(atom in DIRECTION_MAP)) {
    throw new Error(`Unknown Betza atom: ${atom}`);
  }

  const base: MoveAtom = {
    atom,
    kind: classifyGeometry(atom),
    deltasAbstract: DIRECTION_MAP[atom] ?? [],
    maxSteps: classifyGeometry(atom) === "slide" ? Infinity : 1,

    hopCount: mods.hopCount,
    hopStyle: mods.hopStyle,

    moveOnly: mods.moveOnly,
    captureOnly: mods.captureOnly,

    directionalModifiers: mods.directionalModifiers,

    requiresClearPath: mods.requiresClearPath,
    nonJumping: mods.nonJumping,
    againRider: mods.againRider,

    zigzag: mods.zigzag,
    takeAndContinue: mods.takeAndContinue,
    unblockable: mods.unblockable,
    mustCaptureFirst: mods.mustCaptureFirst,
    mustNotCaptureFirst: mods.mustNotCaptureFirst,
    captureThenLeap: mods.captureThenLeap,
  };

  if (mods.againRider) {
    base.kind = "slide";
    base.maxSteps = Infinity;
  }

  if (mods.range !== undefined) {
    base.kind = "slide";
    base.maxSteps = mods.range;
  }

  if (mods.hopStyle === "grasshopper" || mods.hopStyle === "locust") {
    base.kind = "hop";
    base.hopCount = mods.hopCount || 1;
    base.hopStyle = mods.hopStyle;
  }

  if (mods.hopStyle === "cannon") {
    base.hopCount = mods.hopCount;
    base.hopStyle = "cannon";
  }

  if (mods.captureThenLeap) {
    base.mustCaptureFirst = false;
    base.mustNotCaptureFirst = false;
  }

  return base;
}
