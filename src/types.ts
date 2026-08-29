export type Direction = [number, number];

export interface Modifiers {
  t?: boolean; // take and continue
  u?: boolean; // unblockable
  o?: boolean; // must capture first
  x?: boolean; // must not capture first
  y?: boolean; // capture then leap
  p?: boolean; // requires clear path
  z?: boolean; // zig-zag
  g?: boolean; // grasshopper movement
  h?: boolean; // locust movement
  m?: boolean; // move only
  c?: boolean; // capture only
}

export type MoveAtom = {
  atom: string; // atom letter, before modifiers
  kind: "leap" | "slide" | "hop";

  deltasAbstract: Direction[];
  deltasConcrete?: ReadonlyArray<{ df: number; dr: number }>;
  maxSteps: number; // ∞ for slides, 1 for leaps, 1 for hops

  hopCount: number; // 0 = normal, 1 = grasshopper/locust, >1 = cannon
  hopStyle?: "cannon" | "grasshopper" | "locust";

  moveOnly: boolean; // m
  captureOnly: boolean; // c

  directionsRestricted: boolean;
  allowedDirections?: Direction[];

  requiresClearPath: boolean; // p
  againRider: boolean; // a

  zigzag?: boolean; // z
  takeAndContinue?: boolean; // t
  unblockable?: boolean; // u
  mustCaptureFirst?: boolean; // o
  mustNotCaptureFirst?: boolean; // x
  captureThenLeap?: boolean; // y
};

export type SquareKind = "empty" | "friendly" | "enemy";

export type SquareState = {
  kind: SquareKind;
  piece?: string;
};

export type BoardState = {
  width: number;
  height: number;
  get(x: number, y: number): SquareState | undefined;
};

export type PathSquare = {
  x: number;
  y: number;
  sq: SquareState | undefined;
};
