import { Geometry } from ".";

type Delta = { df: number; dr: number };

const VERTICAL = "fbv";
const LATERAL = "lrs";

const isDiagonal = ({ df, dr }: Delta): boolean =>
  df !== 0 && dr !== 0 && Math.abs(df) === Math.abs(dr);
const isOblique = ({ df, dr }: Delta): boolean =>
  df !== 0 && dr !== 0 && Math.abs(df) !== Math.abs(dr);

const perpendicular = (a: string, b: string): boolean =>
  (VERTICAL.includes(a) && LATERAL.includes(b)) ||
  (LATERAL.includes(a) && VERTICAL.includes(b));

// narrow is set when the letter was doubled, as in ffN
type DirectionGroup = { letters: string[]; narrow: boolean };

function readGroups(modifiers: string, allowPairs: boolean): DirectionGroup[] {
  const groups: DirectionGroup[] = [];
  let i = 0;
  while (i < modifiers.length) {
    const letter = modifiers[i];
    const next = modifiers[i + 1];
    if (allowPairs && next === letter) {
      const third = modifiers[i + 2];
      if (third !== undefined && perpendicular(letter, third)) {
        groups.push({ letters: [letter, third], narrow: true });
        i += 3;
      } else {
        groups.push({ letters: [letter], narrow: true });
        i += 2;
      }
      continue;
    }
    if (allowPairs && next !== undefined && perpendicular(letter, next)) {
      groups.push({ letters: [letter, next], narrow: false });
      i += 2;
      continue;
    }
    groups.push({ letters: [letter], narrow: false });
    i += 1;
  }
  return groups;
}

function inHalfPlane(letter: string, { df, dr }: Delta): boolean {
  switch (letter) {
    case "f":
      return dr > 0;
    case "b":
      return dr < 0;
    case "l":
      return df < 0;
    case "r":
      return df > 0;
    case "v":
      return dr !== 0;
    case "s":
      return df !== 0;
    default:
      return true;
  }
}

function matches(group: DirectionGroup, delta: Delta): boolean {
  if (!group.letters.every((letter) => inHalfPlane(letter, delta)))
    return false;

  // Only an oblique delta has a larger and a smaller component.
  if (!isOblique(delta)) return true;
  const verticalMajor = Math.abs(delta.dr) > Math.abs(delta.df);
  if (group.narrow) {
    const wantsVertical = VERTICAL.includes(group.letters[0]);
    if (wantsVertical !== verticalMajor) return false;
  }
  if (group.letters.includes("v") && !verticalMajor) return false;
  if (group.letters.includes("s") && verticalMajor) return false;
  return true;
}

export const SquareRectGeometry: Geometry = {
  meta: { id: "square-rect", version: "1.0.0" },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  atomDeltas(atom, canonical, ctx) {
    return canonical.map(([df, dr]) => ({ df, dr }));
  },

  applyDelta(from, df, dr, ctx) {
    let file = from.file + df;
    let rank = from.rank + dr;

    if (ctx.wrapFiles) {
      file = ((file % ctx.boardWidth) + ctx.boardWidth) % ctx.boardWidth;
    }
    if (ctx.wrapRanks) {
      rank = ((rank % ctx.boardHeight) + ctx.boardHeight) % ctx.boardHeight;
    }

    if (
      file < 0 ||
      file >= ctx.boardWidth ||
      rank < 0 ||
      rank >= ctx.boardHeight
    ) {
      return null;
    }
    return { file, rank };
  },

  selectDirections(deltas, modifiers) {
    const straight = readGroups(modifiers, false);
    const skewed = readGroups(modifiers, true);
    if (straight.length === 0) return deltas;
    return deltas.filter((delta) => {
      const groups = isDiagonal(delta) || isOblique(delta) ? skewed : straight;
      return groups.some((group) => matches(group, delta));
    });
  },
};
