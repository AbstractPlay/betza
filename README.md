# Betza Move Generator

A TypeScript library for generating legal moves for chess and fairy‑chess pieces using Betza notation. If you want to define custom pieces, support variants, or build a move engine with extensible movement rules, this library gives you a clean, predictable API.

## Installation

```bash
npm install @abstractplay/betza
```

or

```bash
yarn add @abstractplay/betza
```

## Quick Start

```ts
import { Piece, RectBoard, generateMoves } from "@abstractplay/betza";

const board = new RectBoard([
  ".....",
  ".....",
  "..F..",
  ".....",
  ".....",
]);

const knight = new Piece("knight", "N", board.geometryContext);
const moves = generateMoves(knight, 2, 2, board);

console.log(moves);
// → [ [ 3, 4 ], [ 4, 3 ], [ 4, 1 ], [ 3, 0 ], [ 1, 0 ], [ 0, 1 ], [ 0, 3 ], [ 1, 4 ] ]
```

- Build a board
- Create a piece (some geometry context is required)
- Generate moves from a coordinate

## Piece orientation (white vs black)

The `Piece` constructor accepts an optional fifth argument, `side` (`"white"` | `"black"`, default `"white"`). Directional modifiers (`fW`, `ffN`, etc.) are oriented relative to this side.

```ts
import { Piece, RectBoard, SquareRectGeometry } from "@abstractplay/betza";

const board = new RectBoard(["........", "........", "....F...", "........", "........", "........", "........", "........"]);
const ctx = board.geometryContext;

const whitePawn = new Piece("pawn", "fmWfcF", ctx, SquareRectGeometry, "white");
const blackPawn = new Piece("pawn", "fmWfcF", ctx, SquareRectGeometry, "black");
```

If your Betza string already encodes direction in modifiers (e.g. `fmWfcF` for a pawn), you may not need to pass `side`. The `Side` type is exported from the package for typing.

## Board Representation

The library uses a simple grid‑based board:

```ts
const board = boardFromGrid([
  "...",
  ".F.",
  ".E.",
]);
```

Characters:

- . → empty
- F → friendly piece
- E → enemy piece

You can also implement your own BoardState as long as it exposes:

```ts
get(x: number, y: number): SquareState | undefined
```

Where SquareState is:
`{ kind: "empty" | "friendly" | "enemy", piece?: string }`

You can implement your own board class:

```ts
class MyBoard {
  get(x: number, y: number) {
    // return { kind: "empty" | "friendly" | "enemy" }
  }
}
```

As long as it implements `get(x,y)`, the engine will work.

## Parsing Betza

Use the `Piece` class to convert a Betza string into a geometry-aware piece definition:

```ts
import { Piece, HexAxialGeometry } from "@abstractplay/betza";

const rook = new Piece("sqrook", "R");
const rookHex = new Piece("hexrook", "R", {boardWidth: 20, boardHeight: 20}, HexAxialGeometry);
const grasshopper = new Piece("grasshopper", "gR");
const hookMover = new Piece("hook", "masR", {boardWidth: 20, boardHeight: 20});
```

By default the `Piece` constructor assumes an 8x8 chessboard. But you can override this by passing at least an appropriate context and a custom geometry if necessary. The library includes the basic square/rect and hex axial geometries.

Geometry affects:

- how deltas are interpreted
- how many directions exist
- how slides propagate
- how hops and leaps are resolved
- how directional modifiers (f, b, l, r) behave

The parser returns a PieceDefinition containing:

- movement atoms
- deltas
- modifiers
- geometry classification (`slide`, `leap`, `hop`)
- maxSteps (∞ for slides, 1 for leaps, hopCount for hops)

You don’t need to inspect this unless you’re extending the engine.

## Generating Moves

```ts
const moves = generateMoves(piece, x, y, board);
```

Returns an array of [x, y] coordinates.

Example:

```ts
import { Piece, RectBoard, generateMoves } from "../src";
const board = new RectBoard([
    "........",
    "........",
    "........",
    "........",
    "....F...",
    "........",
    "........",
    "........",
]);
const piece = new Piece("rook", "R");
const moves = generateMoves(piece, 4, 4, board);
console.log(moves);
// -> [ [ 5, 4 ], [ 6, 4 ], [ 7, 4 ], [ 3, 4 ], [ 2, 4 ], [ 1, 4 ], [ 0, 4 ], [ 4, 5 ], [ 4, 6 ], [ 4, 7 ], [ 4, 3 ], [ 4, 2 ], [ 4, 1 ], [ 4, 0 ] ]
```

## Supported Movement Types (Atoms)

| Atom | Name          | Step Pattern         | Type            |
|------|---------------|----------------------|-----------------|
| W    | Wazir         | (1,0)                | Leaper          |
| F    | Ferz          | (1,1)                | Leaper          |
| D    | Dabbaba       | (2,0)                | Leaper          |
| N    | Knight        | (2,1)                | Leaper          |
| A    | Alfil         | (2,2)                | Leaper          |
| C    | Camel         | (3,1)                | Leaper          |
| Z    | Zebra         | (3,2)                | Leaper          |
| G    | Tripper       | (3,3)                | Leaper          |
| H    | Threeleaper   | (3,0)                | Leaper          |
| (x,y) | Explicit vector | any nonzero vector | Leaper          |
| U    | Universal leaper | every other square | Leaper          |
| R    | Rook          | W‑rider              | Rider           |
| B    | Bishop        | F‑rider              | Rider           |
| Q    | Queen         | R + B                | Rider           |
| K    | King          | W + F                | Derived Leaper  |
| J / L | Historical camel / zebra spellings | (3,1) / (3,2) | Leaper |

Unlimited riders use the zero range (`N0`). The older doubled atom (`NN`) is
also accepted. Use explicit vectors for unnamed atoms, for example `(4,1)` for a
giraffe and `(4,1)0` for its rider.

## Supported Modifiers

| Modifier | Meaning                |
|----------|------------------------|
| i        | only for pieces that haven't moved |
| m / c / e | move / capture / en-passant modality |
| n / j    | non-jumping / must-jump path |
| p / g    | cannon / grasshopper movement |
| q / z    | curved / zig-zag rider |
| o        | cylindrical movement   |
| t        | cannot capture royal pieces |
| a        | another move leg       |
| f/b/l/r/v/s/h | directional restriction |

Modifiers can be combined:

```ts
parseBetza("mRcpR"); // Xiangqi cannon
parseBetza("masR");  // two perpendicular rook legs (hook mover)
parseBetza("fcafmF"); // checker capture: capture, then continue forward
```

## Stateful and game-level notation

`i`, `e`, and `t` use the optional `BoardState.isVirgin`, `isEnPassantTarget`,
and `isRoyal` hooks. Without the corresponding hook the state-dependent move is
unavailable.

The drop atom `@` and the castling atom `O` need a hand and a move history, so
`parseBetza` rejects both. Handle them in your game rules.

## Documentation

The `/doc` folder contains a few diagrams trying to explain the flow of things and includes a JSON file of the basic chess and fairy chess pieces with their Betza strings.

When creating pieces for a specific board, pass `board.geometryContext` to the `Piece` constructor so geometry matches the board dimensions.

## Why Use This Library?

- You want to support fairy‑chess pieces
- You want deterministic, auditable movement rules
- You want to avoid hand‑coding movement logic
- You want a clean, extensible architecture
- You want full Betza support without the headaches
