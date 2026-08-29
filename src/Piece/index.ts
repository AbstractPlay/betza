import type { MoveAtom } from "../types";
import {
  applyGeometry,
  type Geometry,
  type GeometryContext,
} from "../Geometry";
import type { Side } from "../types";
import { parseBetza } from "./parseBetza";
import { SquareRectGeometry } from "../Geometry";

export class Piece {
  public readonly id: string;
  public readonly betza: string;
  public readonly geometry: Geometry;
  public readonly atoms: readonly MoveAtom[];

  /**
   * Parse a Betza string into a geometry-aware piece definition.
   *
   * @param side - Which side the piece belongs to (`"white"` or `"black"`).
   *   Defaults to `"white"`. Directional atoms (`P`, `fW`, `ffN`, etc.) and
   *   their move targets depend on this value. Pass `"black"` for black pieces.
   *
   * @example
   * ```ts
   * const blackPawn = new Piece("pawn", "P", ctx, SquareRectGeometry, "black");
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
    this.atoms = normalized.map((atom) =>
      applyGeometry(atom, geometry, ctx, side),
    );
  }
}
