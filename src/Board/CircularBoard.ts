import type { SquareState, SquareKind } from "../types";
import { BaseBoard } from "./_base";
import type { GeometryContext } from "../Geometry";

export interface CircularBoardOptions {
  wrapX?: boolean;
  wrapY?: boolean;
  centerX?: number;
  centerY?: number;
  radius?: number;
}

export class CircularBoard extends BaseBoard {
  private grid: (string | SquareState[])[];

  private wrapX: boolean;
  private wrapY: boolean;

  private cx: number;
  private cy: number;
  private radius: number;

  constructor(
    rows: (string | SquareState[])[],
    options: CircularBoardOptions = {},
  ) {
    super();
    this.grid = rows;

    this.wrapX = options.wrapX ?? false;
    this.wrapY = options.wrapY ?? false;

    const h = rows.length;
    const w =
      typeof rows[0] === "string"
        ? (rows[0] as string).length
        : (rows[0] as SquareState[]).length;

    this.cx = options.centerX ?? Math.floor(w / 2);
    this.cy = options.centerY ?? Math.floor(h / 2);
    this.radius = options.radius ?? Math.min(w, h) / 2;
  }

public get geometryContext(): GeometryContext {
  return {
    boardWidth: this.width,
    boardHeight: this.height,
    wrapFiles: this.wrapX,
    wrapRanks: this.wrapY,
  };
}

  /**
   * Normalize coordinates according to wrapX / wrapY.
   * Returns null if off-board and wrapping is disabled.
   */
  private resolve(x: number, y: number): { x: number; y: number } | null {
    const h = this.grid.length;
    if (h === 0) return null;

    const w =
      typeof this.grid[0] === "string"
        ? (this.grid[0] as string).length
        : (this.grid[0] as SquareState[]).length;

    // Y handling
    if (this.wrapY) {
      y = ((y % h) + h) % h;
    } else {
      if (y < 0 || y >= h) return null;
    }

    // X handling
    if (this.wrapX) {
      x = ((x % w) + w) % w;
    } else {
      if (x < 0 || x >= w) return null;
    }

    return { x, y };
  }

  /**
   * Returns true if (x, y) lies inside the circular region.
   */
  private inCircle(x: number, y: number): boolean {
    const dx = x - this.cx;
    const dy = y - this.cy;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  /**
   * Returns the square at (x, y), or undefined if off-board or outside circle.
   */
  get(x: number, y: number): SquareState | undefined {
    const pos = this.resolve(x, y);
    if (!pos) return undefined;

    const { x: nx, y: ny } = pos;

    // Circular mask
    if (!this.inCircle(nx, ny)) return undefined;

    const row = this.grid[ny];

    // String row
    if (typeof row === "string") {
      const c = row[nx];

      if (c === ".") return { kind: "empty" };
      if (c === "F") return { kind: "friendly" };
      if (c === "E") return { kind: "enemy" };

      return { kind: "empty" };
    }

    // Object row
    if (Array.isArray(row)) {
      return row[nx];
    }

    throw new Error("Invalid row type");
  }

  /**
   * Sets a square to ".", "F", "E", or a custom piece object.
   */
  set(
    x: number,
    y: number,
    value: "." | "F" | "E" | { piece: string; kind: SquareKind },
  ): void {
    const pos = this.resolve(x, y);
    if (!pos) return;

    const { x: nx, y: ny } = pos;

    // Cannot set outside the circle
    if (!this.inCircle(nx, ny)) return;

    const row = this.grid[ny];

    // Convert string row → SquareState[] on first mutation
    if (typeof row === "string") {
      const arr = row.split("").map((c) => {
        if (c === ".") return { kind: "empty" } as SquareState;
        if (c === "F") return { kind: "friendly" } as SquareState;
        if (c === "E") return { kind: "enemy" } as SquareState;
        return { kind: "empty" } as SquareState;
      });
      this.grid[ny] = arr;
    }

    const cells = this.grid[ny] as SquareState[];

    if (typeof value === "string") {
      if (value === ".") cells[nx] = { kind: "empty" };
      if (value === "F") cells[nx] = { kind: "friendly" };
      if (value === "E") cells[nx] = { kind: "enemy" };
    } else {
      cells[nx] = { piece: value.piece, kind: value.kind };
    }
  }

  public get width(): number {
    const row = this.grid[0];
    return typeof row === "string" ? row.length : (row as SquareState[]).length;
  }

  public get height(): number {
    return this.grid.length;
  }
}
