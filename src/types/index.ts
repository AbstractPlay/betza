export type Piece = {
    id: string;
    name: string;
    xbetza: string;
};

export type ParsedPiece = Piece & {
  atoms: MoveAtom[];
};

export type Direction = [number, number];

// Orthogonal
export const ORTHO: Direction[] = [
  [1,0], [-1,0], [0,1], [0,-1]
];

// Diagonal
export const DIAG: Direction[] = [
  [1,1], [1,-1], [-1,1], [-1,-1]
];

// Knight (1,2)
export const KNIGHT: Direction[] = [
  [1,2], [2,1], [2,-1], [1,-2],
  [-1,2], [-2,1], [-2,-1], [-1,-2]
];

// Dabbaba (2,0)
export const DABBABA: Direction[] = [
  [2,0], [-2,0], [0,2], [0,-2]
];

// Alfil (2,2)
export const ALFIL: Direction[] = [
  [2,2], [2,-2], [-2,2], [-2,-2]
];

// Elephant (3,3)
export const ELEPHANT: Direction[] = [
  [3,3], [3,-3], [-3,3], [-3,-3]
];

// Camel (1,3)
export const CAMEL: Direction[] = [
  [1,3], [3,1], [3,-1], [1,-3],
  [-1,3], [-3,1], [-3,-1], [-1,-3]
];

// Zebra (2,3)
export const ZEBRA: Direction[] = [
  [2,3], [3,2], [3,-2], [2,-3],
  [-2,3], [-3,2], [-3,-2], [-2,-3]
];

// Giraffe (1,4)
export const GIRAFFE: Direction[] = [
    [1,4], [4,1], [4,-1], [1,-4],
    [-1,4], [-4,1], [-4,-1], [-1,-4]
];

export const SQUIRREL: Direction[] = [
    [1,1], [1,-1], [-1,1], [-1,-1],
    [1,0], [-1,0], [0,1], [0,-1]
];

// You can customize this depending on your variant
export const PAWN: Direction[] = [[0,1]];

// Wazir (1,0)
export const WAZIR: Direction[] = ORTHO;

// Ferz (1,1)
export const FERZ: Direction[] = DIAG;

export type MoveAtom = {
  kind: "leap" | "slide" | "hop";

  deltas: Direction[];
  maxSteps: number;

  hopCount: number;
  hopStyle?: "cannon" | "grasshopper";

  moveOnly: boolean;
  captureOnly: boolean;

  directionsRestricted: boolean;
  allowedDirections?: Direction[];

  requiresClearPath: boolean;    // p
  againRider: boolean;           // a

  zigzag?: boolean;              // z
  takeAndContinue?: boolean;     // t
  unblockable?: boolean;         // u
  mustCaptureFirst?: boolean;    // o
  mustNotCaptureFirst?: boolean; // x
  captureThenLeap?: boolean;     // y
};

export type SquareState =
  | { kind: "empty" }
  | { kind: "friendly"; pieceId?: string }
  | { kind: "enemy"; pieceId?: string };

export type BoardState = {
  width: number;
  height: number;
  get(x: number, y: number): SquareState | undefined;
};
