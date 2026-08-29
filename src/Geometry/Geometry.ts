// Identifies a geometry plugin
export interface GeometryId {
  readonly id: string; // e.g. "square-rect", "hex-axial"
  readonly version: string; // semantic versioning, e.g. "1.0.0"
}

export interface BoardCoordinate {
  readonly file: number; // x
  readonly rank: number; // y
}

export interface GeometryContext {
  readonly boardWidth: number;
  readonly boardHeight: number;
  readonly wrapFiles?: boolean;
  readonly wrapRanks?: boolean;
}

// Fundamental: interpret an abstract step into concrete displacements
export interface Geometry {
  readonly meta: GeometryId;

  // Resolve one Betza atom into this board's native directions
  atomDeltas(
    atom: string,
    canonical: ReadonlyArray<readonly [number, number]>,
    ctx: GeometryContext,
  ): ReadonlyArray<{ df: number; dr: number }>;

  // Apply a delta to a coordinate, with bounds rules
  applyDelta(
    from: BoardCoordinate,
    df: number,
    dr: number,
    ctx: GeometryContext,
  ): BoardCoordinate | null;

  // Optional: narrows deltas down to the direction modifiers (f/b/l/r/v/s)
  selectDirections?(
    deltas: ReadonlyArray<{ df: number; dr: number }>,
    modifiers: string,
  ): ReadonlyArray<{ df: number; dr: number }>;
}
