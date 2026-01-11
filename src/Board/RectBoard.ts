import type { SquareState } from "../types";
import type { GeometryContext } from "../Geometry";
import { BaseBoard } from "./_base";

export interface RectBoardOptions {
  wrapX?: boolean;
  wrapY?: boolean;
}

export class RectBoard extends BaseBoard {
  private grid: (string | SquareState[])[];

  private wrapX: boolean;
  private wrapY: boolean;

  constructor(
    rows: (string | SquareState[])[],
    options: RectBoardOptions = {},
  ) {
    super();
    this.grid = rows;
    this.wrapX = options.wrapX ?? false;
    this.wrapY = options.wrapY ?? false;
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
   * Returns the square at (x, y), or undefined if off-board.
   */
  get(x: number, y: number): SquareState | undefined {
    const pos = this.resolve(x, y);
    if (!pos) return undefined;

    const { x: nx, y: ny } = pos;
    const row = this.grid[ny];

    // String row: "...F.E."
    if (typeof row === "string") {
      const c = row[nx];

      if (c === ".") return { kind: "empty" } as SquareState;
      if (c === "F") return { kind: "friendly" } as SquareState;
      if (c === "E") return { kind: "enemy" } as SquareState;

      return { kind: "empty" };
    }

    // Array row: SquareState[]
    if (Array.isArray(row)) {
      return row[nx];
    }

    throw new Error("Invalid row type");
  }

  /**
   * Sets a square to ".", "F", "E", or a custom piece object.
   */
  set(x: number, y: number, value: "." | "F" | "E" | SquareState): void {
    const pos = this.resolve(x, y);
    if (!pos) return;

    const { x: nx, y: ny } = pos;
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
      if (value === ".") cells[nx] = { kind: "empty" } as SquareState;
      if (value === "F") cells[nx] = { kind: "friendly" } as SquareState;
      if (value === "E") cells[nx] = { kind: "enemy" } as SquareState;
    } else {
      cells[nx] = { piece: value.piece, kind: value.kind } as SquareState;
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
