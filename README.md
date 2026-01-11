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
const hexTakeAndContinueRook = new Piece("hextrrook", "tR", {boardWidth: 20, boardHeight: 20}, HexAxialGeometry);
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
    "........",
    "........",
    "........",
    "........",
]);
const piece = new Piece("trrook", "tR"); // take-and-continue rook on standard 8x8 chessboard
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
| H    | Threeleaper   | (3,0)                | Leaper          |
| C    | Camel         | (3,1)                | Leaper          |
| Z    | Zebra         | (3,2)                | Leaper          |
| G    | Tripper       | (3,3)                | Leaper          |
| R    | Rook          | W‑rider              | Rider           |
| B    | Bishop        | F‑rider              | Rider           |
| Q    | Queen         | R + B                | Rider           |
| K    | King          | W + F                | Derived Leaper  |
| M    | Mann          | W                    | Derived Leaper  |
| S    | Squirrel      | F + D                | Derived Leaper  |
| J    | Jumping Gen.  | D + N                | Derived Leaper  |
| U    | Unicorn       | (3,3) rider (G‑rider)| Derived Rider   |

## Supported Modifiers

| Modifier | Meaning                |
|----------|------------------------|
| t        | take and continue      |
| u        | unblockable            |
| o        | must capture first     |
| x        | must not capture first |
| y        | capture then leap      |
| p        | requires clear path    |
| z        | zig‑zag                |
| g        | grasshopper movement   |
| h        | locust movement        |
| m        | move only              |
| c        | capture only           |

Modifiers can be combined:

```ts
parseBetza("tuR"); // unblockable take-and-continue rook
parseBetza("yN");  // capture-then-leap knight
parseBetza("pgB"); // clear-path grasshopper bishop
```

## Atom × Modifier Compatibility Matrix

| Modifier                   | Leapers (W,F,N,…)  | Riders (R,B,Q) | Hoppers (g,h) | Notes  |
|----------------------------|--------------------|----------------|---------------|--------|
| t (take & continue) | ✔️ | ✔️ | ✔️ | Works for any capturing move |
| u (unblockable) | ✔️ | ⚠️ | — | Riders only unblockable if range-limited |
| o (must capture first) | ✔️ | ✔️ | ✔️ | Applies to any move with a capture option |
| x (must not capture first) | ✔️ | ✔️ | ✔️ | Same as above, inverted |
| y (capture then leap) | ✔️ | ⚠️ | — | Riders only if first step is capture |
| p (requires clear path) | — | ✔️ | — | Only meaningful for riders |
| z (zig‑zag) | ✔️ | ✔️ | — | Requires multi-step geometry |
| g (grasshopper movement) | — | — | ✔️ | Converts atom into hopper |
| h (locust movement) | — | — | ✔️ | Converts atom into hopper |
| m (move‑only) | ✔️ | ✔️ | ✔️ | Universal |
| c (capture‑only) | ✔️ | ✔️ | ✔️ | Universal |

Legend:

- ✔️ fully supported
- ⚠️ conditionally meaningful (depends on range, hop, or capture rules)
- — not meaningful for that atom type

## Documentation

The `/docs` folder contains a few diagrams trying to explain the flow of things and includes a JSON file of the basic chess and fairy chess pieces with their Betza strings.

## Why Use This Library?

- You want to support fairy‑chess pieces
- You want deterministic, auditable movement rules
- You want to avoid hand‑coding movement logic
- You want a clean, extensible architecture
- You want full Betza support without the headaches
