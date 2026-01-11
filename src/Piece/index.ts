import type { MoveAtom } from "../types";
import {
  applyGeometry,
  type Geometry,
  type GeometryContext,
} from "../Geometry";
import { parseXBetza } from "./parseXBetza";
import { SquareRectGeometry } from "../Geometry";

export class Piece {
  public readonly id: string;
  public readonly xbetza: string;
  public readonly geometry: Geometry;
  public atoms: MoveAtom[];

  constructor(
    id: string,
    xbetza: string,
    ctx: GeometryContext,
    geometry: Geometry = SquareRectGeometry,
  ) {
    this.id = id;
    this.xbetza = xbetza;
    this.geometry = geometry;
    const normalized = parseXBetza(xbetza);
    this.atoms = normalized.map((atom) => applyGeometry(atom, geometry, ctx));
  }
}
