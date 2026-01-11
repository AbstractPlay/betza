# XBetza Move Generator

A TypeScript library for generating legal moves for chess and fairy‑chess pieces using XBetza notation. If you want to define custom pieces, support variants, or build a move engine with extensible movement rules, this library gives you a clean, predictable API.

## Installation

```bash
npm install @abstractplay/xbetza
```

or

```bash
yarn add @abstractplay/xbetza
```

## Quick Start

```ts
import { parseXBetza, generateMoves } from "@abstractplay/xbetza";

const board = boardFromGrid([
  "...",
  ".F.",
  "...",
]);

const piece = parseXBetza("N"); // Knight
const moves = generateMoves(piece, 1, 1, board);

console.log(moves);
// → [ [0,3], [2,3], [3,2], ... ]
```

That’s the entire workflow:

- Build a board
- Parse an XBetza string
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

## Parsing XBetza

Use `parseXBetza` to convert a Betza string into a piece definition:

```ts
const rook = parseXBetza("R");
const nightrider = parseXBetza("RN");
const grasshopper = parseXBetza("gR");
const takeAndContinueRook = parseXBetza("tR");
```

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
const piece = parseXBetza("tR"); // take-and-continue rook
const moves = generateMoves(piece, 4, 4, board);

moves.forEach(([x, y]) => console.log(x, y));
```

## Supported Movement Types (Atoms)

| Atom | Name          | Step Pattern        | Type            |
|------|---------------|----------------------|------------------|
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

| Modifier | Meaning               |
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
parseXBetza("tuR"); // unblockable take-and-continue rook
parseXBetza("yN");  // capture-then-leap knight
parseXBetza("pgB"); // clear-path grasshopper bishop
```

## Atom × Modifier Compatibility Matrix

| Modifier | Leapers (W,F,N,…) | Riders (R,B,Q) | Hoppers (g,h) | Notes |
|----------|--------------------|----------------|---------------|--------|
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

## Examples

### Knight

```ts
const knight = parseXBetza("N");
generateMoves(knight, 4, 4, board);
```

### Nightrider

```ts
const nr = parseXBetza("RN");
generateMoves(nr, 4, 4, board);
```

### Grasshopper

```ts
const g = parseXBetza("gR");
generateMoves(g, 4, 4, board);
```

### Locust

```ts
const locust = parseXBetza("hR");
generateMoves(locust, 4, 4, board);
```

### Take‑and‑Continue Rook

```ts
const tR = parseXBetza("tR");
generateMoves(tR, 4, 4, board);
```

### Capture‑Then‑Leap Knight

```ts
const yN = parseXBetza("yN");
generateMoves(yN, 4, 4, board);
```

## Geometry Support

The engine supports multiple board geometries.

By default, `parseXBetza()` assumes square geometry, but you can explicitly request others:

```ts
parseXBetza("R", { geometry: "square" });
parseXBetza("R", { geometry: "hex" });
```

Geometry affects:

- how deltas are interpreted
- how many directions exist
- how slides propagate
- how hops and leaps are resolved
- how directional modifiers (f, b, l, r) behave

### Hex Geometry

Hex geometry uses six primary directions instead of eight.
The engine automatically remaps XBetza atoms into hex‑appropriate deltas.

#### Example: Hex Wazir (W)

```ts
const wazirHex = parseXBetza("W", { geometry: "hex" });
```

Produces a piece with 6 orthogonal hex directions:

```ts
[+1, 0], [+1, -1], [0, -1],
[-1, 0], [-1, +1], [0, +1]
```

#### Example: Hex Rook (R)

```ts
const rookHex = parseXBetza("R", { geometry: "hex" });
```

This becomes a hex‑rider sliding along the same 6 directions.

#### Example: Hex Bishop (B)

```ts
const bishopHex = parseXBetza("B", { geometry: "hex" });
```

In hex geometry, “diagonal” movement is not the same as square boards.
The engine maps B to the other 6 diagonal hex directions (the “off‑axes” directions).

#### Example: Hex Knight (N)

```ts
const knightHex = parseXBetza("N", { geometry: "hex" });
```

Hex knights use the standard “(2,1)” axial offsets:

```ts
[+2, -1], [+1, -2], [-1, -1],
[-2, +1], [-1, +2], [+1, +1]
```

### Generating Moves on a Hex Board

You can build a hex board using axial coordinates:

```ts
const board = {
  get(x, y) {
    // return { kind: "empty" | "friendly" | "enemy" }
  }
};
```

Then:

```ts
const piece = parseXBetza("R", { geometry: "hex" });
const moves = generateMoves(piece, 0, 0, board);
```

## Custom Pieces

You can define pieces directly without XBetza:

```ts
const customPiece = {
  atoms: [
    {
      type: "slide",
      deltas: [[1,0], [-1,0], [0,1], [0,-1]],
      maxSteps: Infinity,
      takeAndContinue: true,
      unblockable: false,
      // etc...
    }
  ]
};
```

Then:

```ts
generateMoves(customPiece, x, y, board);
```

## Testing

The library is designed for unit testing:

- Each movement type is isolated
- Each modifier is isolated
- The pipeline is deterministic

Example:

```ts
expect(generateMoves(parseXBetza("R"), 1, 1, board))
  .to.deep.include([1, 3]);
```

## Why Use This Library?

- You want to support fairy‑chess pieces
- You want deterministic, auditable movement rules
- You want to avoid hand‑coding movement logic
- You want a clean, extensible architecture
- You want full XBetza support without the headaches
