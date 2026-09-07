export type Direction = [number, number];
export type Side = "white" | "black";

export type MoveAtom = {
  atom: string; // atom letter, before modifiers
  kind: "leap" | "slide" | "hop";

  deltasAbstract: Direction[];
  deltasConcrete?: ReadonlyArray<{ df: number; dr: number }>;
  maxSteps: number; // ∞ for slides, 1 for leaps, 1 for hops

  hopCount: number; // number of occupied platforms which must be crossed
  hopStyle?: "cannon" | "grasshopper";

  moveOnly: boolean; // m
  captureOnly: boolean; // c

  directionalModifiers?: string; // f/b/l/r/v/s/h

  nonJumping?: boolean; // n
  mustJump?: number; // j/jj

  curved?: boolean; // q
  zigzag?: boolean; // z
  cylindrical?: boolean; // o
  initialOnly?: boolean; // i
  enPassantOnly?: boolean; // e
  tame?: boolean; // t
  continuations?: MoveAtom[]; // a
  passThrough?: boolean; // p on a non-final leg
};

export type SquareKind = "empty" | "friendly" | "enemy";

export type SquareState = {
  kind: SquareKind;
  piece?: string;
};

export type BoardState = {
  width: number;
  height: number;
  /** Treat the corresponding coordinate axis as cyclic for every atom. */
  wrapFiles?: boolean;
  wrapRanks?: boolean;
  get(x: number, y: number): SquareState | undefined;
  isVirgin?(x: number, y: number): boolean;
  isEnPassantTarget?(x: number, y: number): boolean;
  isRoyal?(x: number, y: number): boolean;
};

export type PathSquare = {
  x: number;
  y: number;
  sq: SquareState | undefined;
};
