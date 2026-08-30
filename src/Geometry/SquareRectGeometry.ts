import { Geometry } from "./index.js";
import {
  type Delta,
  type DirectionGroup,
  directionConstants,
  inHalfPlane,
  readDirectionGroups,
} from "./directionModifiers.js";

const { VERTICAL } = directionConstants;

const isDiagonal = ({ df, dr }: Delta): boolean =>
  df !== 0 && dr !== 0 && Math.abs(df) === Math.abs(dr);
const isOblique = ({ df, dr }: Delta): boolean =>
  df !== 0 && dr !== 0 && Math.abs(df) !== Math.abs(dr);

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
    const straight = readDirectionGroups(modifiers, false);
    const skewed = readDirectionGroups(modifiers, true);
    if (straight.length === 0) return deltas;
    return deltas.filter((delta) => {
      const groups = isDiagonal(delta) || isOblique(delta) ? skewed : straight;
      return groups.some((group) => matches(group, delta));
    });
  },
};
