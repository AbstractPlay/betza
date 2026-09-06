import type { MoveAtom } from "../types.js";
import { expandAtom } from "./expandAtom.js";

const DIRECTION_MODIFIERS = "fblrvsh";
type ParsedModifiers = Parameters<typeof expandAtom>[1];

const defaults = (): ParsedModifiers => ({
  moveOnly: false, captureOnly: false, hopCount: 0,
  nonJumping: false, mustJump: 0, curved: false, zigzag: false,
  cylindrical: false, initialOnly: false, enPassantOnly: false, tame: false,
});

/** Parse the Betza/XBetza language implemented by GNU XBoard 4.8. */
export function parseBetza(source: string): MoveAtom[] {
  if (source.length === 0) throw new Error("Empty Betza string");

  const atoms: MoveAtom[] = [];
  let i = 0;
  while (i < source.length) {
    const legs: ParsedModifiers[] = [defaults()];
    let leg = legs[0];

    while (i < source.length) {
      const c = source[i];
      if (c === "a") { legs.push(defaults()); leg = legs[legs.length - 1]; i++; }
      else if (c === "m") { leg.moveOnly = true; i++; }
      else if (c === "c") { leg.captureOnly = true; i++; }
      else if (c === "n") { leg.nonJumping = true; i++; }
      else if (c === "j") { leg.mustJump = (leg.mustJump ?? 0) + 1; i++; }
      else if (c === "p") {
        if (legs.length > 1 || /^[^A-Z@]*a/.test(source.slice(i + 1))) leg.passThrough = true;
        else { leg.hopStyle = "cannon"; leg.hopCount = 1; }
        i++;
      }
      else if (c === "g") { leg.hopStyle = "grasshopper"; leg.hopCount = 1; i++; }
      else if (c === "q") { leg.curved = true; i++; }
      else if (c === "z") { leg.zigzag = true; i++; }
      else if (c === "o") { leg.cylindrical = true; i++; }
      else if (c === "i") { leg.initialOnly = true; i++; }
      else if (c === "e") { leg.enPassantOnly = true; i++; }
      else if (c === "t") { leg.tame = true; i++; }
      else if (DIRECTION_MODIFIERS.includes(c)) {
        leg.directionalModifiers = (leg.directionalModifiers ?? "") + c; i++;
      }
      else break;
    }

    if (i >= source.length) throw new Error("Unexpected end of Betza string");
    let atom = source[i++];
    if (atom === "(") {
      const vector = /^(\d+,\d+)\)/.exec(source.slice(i));
      if (!vector) throw new Error(`Invalid Betza vector atom at position ${i - 1}`);
      atom = `(${vector[1]})`;
      i += vector[0].length;
    } else if (!/[A-Z@]/.test(atom)) {
      throw new Error(`Expected a Betza atom at position ${i - 1}, got '${atom}'`);
    }
    if (atom === "@") {
      throw new Error("The XBetza drop atom '@' requires a hand, not a board origin; use a game drop rule");
    }

    const doubled = atom.length === 1 && source[i] === atom;
    if (doubled) i++;
    const digits = /^\d+/.exec(source.slice(i));
    let range: number | undefined;
    if (digits) { range = Number.parseInt(digits[0], 10); i += digits[0].length; }
    else if (doubled) range = 0;

    const expanded = legs.map((mods, index) => {
      if (index < legs.length - 1 && !mods.captureOnly && !mods.passThrough) mods.moveOnly = true;
      return expandAtom(atom, {...mods, range});
    });
    if (expanded.length > 1) expanded[0].continuations = expanded.slice(1);
    atoms.push(expanded[0]);
  }
  return atoms;
}
