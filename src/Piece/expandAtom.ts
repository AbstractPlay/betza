import type { MoveAtom } from "../types.js";
import { classifyGeometry, DIRECTION_MAP } from "../Geometry/index.js";

export function expandAtom(
  atom: string,
  mods: {
    moveOnly: boolean;
    captureOnly: boolean;
    hopCount: number;
    directionalModifiers?: string;
    range?: number;

    nonJumping?: boolean;
    mustJump?: number;
    hopStyle?: "cannon" | "grasshopper";
    curved: boolean;
    zigzag: boolean;
    cylindrical: boolean;
    initialOnly: boolean;
    enPassantOnly: boolean;
    tame: boolean;
    passThrough?: boolean;
  },
): MoveAtom {
  const vector = /^\((\d+),(\d+)\)$/.exec(atom);
  const deltas = vector
    ? vectorDeltas(Number(vector[1]), Number(vector[2]))
    : DIRECTION_MAP[atom];
  if (!deltas) {
    throw new Error(`Unknown Betza atom: ${atom}`);
  }

  const base: MoveAtom = {
    atom,
    kind: classifyGeometry(atom),
    deltasAbstract: deltas,
    maxSteps: classifyGeometry(atom) === "slide" ? Infinity : 1,

    hopCount: mods.hopCount,
    hopStyle: mods.hopStyle,

    moveOnly: mods.moveOnly,
    captureOnly: mods.captureOnly,

    directionalModifiers: mods.directionalModifiers,

    nonJumping: mods.nonJumping,
    mustJump: mods.mustJump,
    curved: mods.curved,
    zigzag: mods.zigzag,
    cylindrical: mods.cylindrical,
    initialOnly: mods.initialOnly,
    enPassantOnly: mods.enPassantOnly,
    tame: mods.tame,
    passThrough: mods.passThrough,
  };

  if (mods.range !== undefined) {
    base.kind = "slide";
    base.maxSteps = mods.range === 0 ? Infinity : mods.range;
  }

  if (mods.hopStyle === "grasshopper") {
    base.kind = "hop";
    base.hopCount = mods.hopCount || 1;
    base.hopStyle = mods.hopStyle;
  }

  if (mods.hopStyle === "cannon") {
    base.hopCount = mods.hopCount;
    base.hopStyle = "cannon";
  }

  if (mods.nonJumping && base.kind !== "leap") {
    throw new Error(
      `The 'n' (blockable leap) modifier applies only to leapers; atom '${atom}' is a ${base.kind}.`,
    );
  }

  return base;
}

function vectorDeltas(a: number, b: number): Array<[number, number]> {
  if (a === 0 && b === 0) throw new Error("Betza vector (0,0) is not a move");
  const out = new Map<string, [number, number]>();
  for (const [x, y] of [[a, b], [b, a]]) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      out.set(`${x * sx},${y * sy}`, [x * sx, y * sy]);
    }
  }
  return [...out.values()];
}
