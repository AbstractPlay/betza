import { generateHopMoves } from "./generateHopMoves.js";
import { generateLeapMoves } from "./generateLeapMoves.js";
import { generateSlideMoves } from "./generateSlideMoves.js";
import { dedupeMoves } from "./utils.js";

import type { MoveAtom, BoardState } from "../types.js";

export function generateMoves(
  piece: { atoms: readonly MoveAtom[] },
  x: number,
  y: number,
  board: BoardState,
): Array<[number, number]> {
  const results: Array<[number, number]> = [];

  for (const atom of piece.atoms) {
    if (atom.continuations?.length) {
      generateMultiLeg(atom, x, y, board, results);
      continue;
    }
    generateAtom(atom, x, y, board, results);
  }

  return dedupeMoves(results);
}

function generateAtom(atom: MoveAtom, x: number, y: number, board: BoardState, results: Array<[number, number]>): void {
    if (atom.atom === "U") {
      if (atom.initialOnly && board.isVirgin?.(x, y) !== true) return;
      for (let ny = 0; ny < board.height; ny++) for (let nx = 0; nx < board.width; nx++) {
        if (nx === x && ny === y) continue;
        const sq = board.get(nx, ny);
        if (!sq || sq.kind === "friendly") continue;
        if (sq.kind === "empty" && atom.captureOnly && !atom.moveOnly) continue;
        if (sq.kind === "empty" && atom.enPassantOnly && board.isEnPassantTarget?.(nx, ny) !== true) continue;
        if (sq.kind === "enemy" && atom.moveOnly && !atom.captureOnly) continue;
        if (sq.kind === "enemy" && atom.tame && board.isRoyal?.(nx, ny) === true) continue;
        results.push([nx, ny]);
      }
      return;
    }
    const wrapFiles = atom.cylindrical || board.wrapFiles === true;
    const wrapRanks = board.wrapRanks === true;
    if (wrapFiles || wrapRanks) {
      const wrapped: BoardState = {
        ...board,
        wrapFiles: false,
        wrapRanks: false,
        get(f, r) {
          const file = wrapFiles ? ((f % board.width) + board.width) % board.width : f;
          const rank = wrapRanks ? ((r % board.height) + board.height) % board.height : r;
          return board.get(file, rank);
        },
      };
      const raw: Array<[number, number]> = [];
      const cycle = wrapFiles && wrapRanks
        ? board.width * board.height
        : (wrapFiles ? board.width : board.height);
      generateAtom({...atom, cylindrical: false, maxSteps: Math.min(atom.maxSteps, cycle)}, x, y, wrapped, raw);
      results.push(...raw.map(([f, r]) => [
        wrapFiles ? ((f % board.width) + board.width) % board.width : f,
        wrapRanks ? ((r % board.height) + board.height) % board.height : r,
      ] as [number, number]));
      return;
    }
    switch (atom.kind) {
      case "leap":
        generateLeapMoves(atom, x, y, board, results);
        break;

      case "slide":
        generateSlideMoves(atom, x, y, board, results);
        break;

      case "hop":
        generateHopMoves(atom, x, y, board, results);
        break;
    }
}

function generateMultiLeg(atom: MoveAtom, x: number, y: number, board: BoardState, results: Array<[number, number]>): void {
  const legs = [{...atom, continuations: undefined}, ...(atom.continuations ?? [])];
  walkLeg(legs, 0, x, y, board, undefined, results);
}

function walkLeg(
  legs: MoveAtom[], index: number, x: number, y: number, board: BoardState,
  previous: {df: number; dr: number} | undefined, results: Array<[number, number]>,
): void {
  let leg = legs[index];
  if (previous) leg = relativeLeg(leg, previous);
  const targets: Array<[number, number]> = [];
  if (leg.passThrough && index < legs.length - 1) generatePlatforms(leg, x, y, board, targets);
  else generateAtom(leg, x, y, board, targets);

  if (index === legs.length - 1) {
    results.push(...targets);
    return;
  }
  for (const [nx, ny] of targets) {
    const nextBoard = movedBoard(board, x, y, nx, ny);
    walkLeg(legs, index + 1, nx, ny, nextBoard, {df: nx - x, dr: ny - y}, results);
  }
}

function generatePlatforms(atom: MoveAtom, x: number, y: number, board: BoardState, out: Array<[number, number]>): void {
  for (const {df, dr} of atom.deltasConcrete ?? []) {
    for (let step = 1; step <= atom.maxSteps; step++) {
      const nx = x + df * step;
      const ny = y + dr * step;
      const sq = board.get(nx, ny);
      if (!sq) break;
      if (sq.kind !== "empty") { out.push([nx, ny]); break; }
      if (atom.kind === "leap") break;
    }
  }
}

function relativeLeg(atom: MoveAtom, previous: {df: number; dr: number}): MoveAtom {
  const deltas = [...(atom.deltasConcrete ?? [])];
  const modifiers = atom.directionalModifiers;
  const angle = ({df, dr}: {df: number; dr: number}) => {
    let value = Math.atan2(df, dr) - Math.atan2(previous.df, previous.dr);
    while (value <= -Math.PI) value += 2 * Math.PI;
    while (value > Math.PI) value -= 2 * Math.PI;
    return value;
  };
  let selected = deltas;
  if (!modifiers) {
    selected = deltas.filter(delta => Math.abs(Math.abs(angle(delta)) - Math.PI) > 1e-9);
  } else {
    const wanted: number[] = [];
    if (modifiers.includes("f")) wanted.push(0);
    if (modifiers.includes("b")) wanted.push(Math.PI);
    if (modifiers.includes("r") || modifiers.includes("s")) wanted.push(Math.PI / 2);
    if (modifiers.includes("l") || modifiers.includes("s")) wanted.push(-Math.PI / 2);
    if (modifiers.includes("v")) wanted.push(0, Math.PI);
    const distance = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    const best = Math.min(...deltas.map(delta => Math.min(...wanted.map(target => distance(angle(delta), target)))));
    selected = deltas.filter(delta => Math.min(...wanted.map(target => distance(angle(delta), target))) <= best + 1e-9);
  }
  return {...atom, deltasConcrete: selected};
}

function movedBoard(board: BoardState, x: number, y: number, nx: number, ny: number): BoardState {
  return {
    ...board,
    get(f, r) {
      if (f === x && r === y) return {kind: "empty"};
      if (f === nx && r === ny) return {kind: "friendly"};
      return board.get(f, r);
    },
    isVirgin: board.isVirgin?.bind(board),
    isEnPassantTarget: board.isEnPassantTarget?.bind(board),
    isRoyal: board.isRoyal?.bind(board),
  };
}
