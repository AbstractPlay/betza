import type { MoveAtom } from "../types.js";
import {
  applyGeometry,
  type Geometry,
  type GeometryContext,
} from "../Geometry/index.js";
import type { Side } from "../types.js";
import { parseBetza } from "./parseBetza.js";
import { SquareRectGeometry } from "../Geometry/index.js";

export class Piece {
  public readonly id: string;
  public readonly betza: string;
  public readonly geometry: Geometry;
  public readonly atoms: readonly MoveAtom[];

  /**
   * Parse a Betza string into a geometry-aware piece definition.
   *
   * @param side - Which side the piece belongs to (`"white"` or `"black"`).
   *   Defaults to `"white"`. Directional expressions (`fW`, `ffN`, etc.) and
   *   their move targets are resolved relative to this side.
   *
   * @example
   * ```ts
   * const blackPawn = new Piece("pawn", "fmWfcF", ctx, SquareRectGeometry, "black");
   * ```
   *
   * Betza strings that encode direction explicitly in modifiers (e.g. `fmWfcF`)
   * may not need a non-default `side`.
   */
  constructor(
    id: string,
    betza: string,
    ctx: GeometryContext = { boardHeight: 8, boardWidth: 8 },
    geometry: Geometry = SquareRectGeometry,
    side: Side = "white",
  ) {
    this.id = id;
    this.betza = betza;
    this.geometry = geometry;
    const normalized = parseBetza(betza);
    const orient = (atom: MoveAtom, continuation = false): MoveAtom => {
      // Continuation directions are relative to the preceding leg, so keep the
      // modifier for move generation instead of resolving it against the board.
      const rawDirections = atom.directionalModifiers;
      const oriented = applyGeometry(
        continuation ? {...atom, directionalModifiers: undefined} : atom,
        geometry, ctx, side,
      );
      if (continuation) oriented.directionalModifiers = rawDirections;
      if (atom.continuations) {
        oriented.continuations = atom.continuations.map(child => orient(child, true));
      }
      return oriented;
    };
    this.atoms = normalized.map(atom => orient(atom));
  }
}
