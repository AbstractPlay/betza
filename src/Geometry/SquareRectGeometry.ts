import { Geometry } from ".";

export const SquareRectGeometry: Geometry = {
  meta: { id: "square-rect", version: "1.0.0" },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interpretVector(dx, dy, ctx) {
    // For orthodox square boards, (dx, dy) is already in board space
    return [{ df: dx, dr: dy }];
  },

  applyDelta(from, df, dr, ctx) {
    let file = from.file + df;
    let rank = from.rank + dr;

    if (ctx.wrapFiles) {
      file = ((file % ctx.boardWidth) + ctx.boardWidth) % ctx.boardWidth;
    }
    if (ctx.wrapRanks) {
      rank = ((rank % ctx.boardHeight) + ctx.boardHeight) % ctx.boardHeight;
    }

    if (
      file < 0 ||
      file >= ctx.boardWidth ||
      rank < 0 ||
      rank >= ctx.boardHeight
    ) {
      return null;
    }
    return { file, rank };
  },

  resolveDirectionKeyword(keyword, sideToMove) {
    const forward = sideToMove === "white" ? 1 : -1;
    switch (keyword) {
      case "f":
        return { dx: 0, dy: forward };
      case "b":
        return { dx: 0, dy: -forward };
      case "l":
        return { dx: -1, dy: 0 };
      case "r":
        return { dx: 1, dy: 0 };
      case "v":
        return { dx: 0, dy: forward }; // alias of f
      case "s":
        return { dx: 0, dy: -forward }; // alias of b
      case "h":
        return { dx: 0, dy: 0 }; // or disallow
    }
  },
};
