import type { MoveAtom } from "../types";
import {
  applyGeometry,
  type Geometry,
  type GeometryContext,
} from "../Geometry";
import { parseBetza } from "./parseBetza";
import { SquareRectGeometry } from "../Geometry";

export class Piece {
  public readonly id: string;
  public readonly betza: string;
  public readonly geometry: Geometry;
  public atoms: MoveAtom[];

  constructor(
    id: string,
    betza: string,
    ctx: GeometryContext = { boardHeight: 8, boardWidth: 8 },
    geometry: Geometry = SquareRectGeometry,
  ) {
    this.id = id;
    this.betza = betza;
    this.geometry = geometry;
    const normalized = parseBetza(betza);
    this.atoms = normalized.map((atom) => applyGeometry(atom, geometry, ctx));
  }
}
