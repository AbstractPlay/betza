export type Delta = { df: number; dr: number };

const VERTICAL = "fbv";
const LATERAL = "lrs";

const perpendicular = (a: string, b: string): boolean =>
  (VERTICAL.includes(a) && LATERAL.includes(b)) ||
  (LATERAL.includes(a) && VERTICAL.includes(b));

/** narrow is set when the letter was doubled, as in ffN */
export type DirectionGroup = { letters: string[]; narrow: boolean };

export function readDirectionGroups(
  modifiers: string,
  allowPairs: boolean,
): DirectionGroup[] {
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

export function inHalfPlane(letter: string, { df, dr }: Delta): boolean {
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

export function matchesHalfPlanes(group: DirectionGroup, delta: Delta): boolean {
  return group.letters.every((letter) => inHalfPlane(letter, delta));
}

export function selectByHalfPlanes(
  deltas: ReadonlyArray<Delta>,
  modifiers: string,
): Delta[] {
  const groups = readDirectionGroups(modifiers, true);
  if (groups.length === 0) return [...deltas];
  return deltas.filter((delta) =>
    groups.some((group) => matchesHalfPlanes(group, delta)),
  );
}

export const directionConstants = { VERTICAL, LATERAL };
