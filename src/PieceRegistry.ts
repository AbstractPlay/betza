import builtIn from "./pieces.json";
import { Piece, ParsedPiece } from "./types";
import { parseXBetza } from "./parseXBetza";

export class PieceRegistry {
  private pieces: Map<string, ParsedPiece>;

  constructor(customPieces: Piece[] = []) {
    this.pieces = new Map();

    // Load built‑in pieces
    for (const p of builtIn.pieces as Piece[]) {
      this.register(p);
    }

    // Load custom pieces (override allowed)
    for (const p of customPieces) {
      this.register(p);
    }
  }

  private validatePiece(p: Piece) {
    if (!p || typeof p !== "object") {
      throw new Error("Invalid piece: not an object");
    }
    if (typeof p.id !== "string" || !p.id.trim()) {
      throw new Error(`Invalid piece id: ${JSON.stringify(p)}`);
    }
    if (typeof p.name !== "string" || !p.name.trim()) {
      throw new Error(`Invalid piece name: ${p.id}`);
    }
    if (typeof p.xbetza !== "string" || !p.xbetza.trim()) {
      throw new Error(`Invalid xbetza for piece: ${p.id}`);
    }
  }

  private register(p: Piece) {
    this.validatePiece(p);

    const atoms = parseXBetza(p.xbetza);

    const parsed: ParsedPiece = {
      ...p,
      atoms
    };

    this.pieces.set(p.id, parsed);
  }

  get(id: string): ParsedPiece | undefined {
    return this.pieces.get(id);
  }

  getAll(): ParsedPiece[] {
    return [...this.pieces.values()];
  }

  has(id: string): boolean {
    return this.pieces.has(id);
  }
}
