import { type Position, createPosition } from './types.js';

export type Direction = 'north' | 'south' | 'east' | 'west';

const DIRECTION_OFFSETS: Record<Direction, { dc: number; dr: number }> = {
  north: { dc: 0, dr: -1 },
  south: { dc: 0, dr: 1 },
  east:  { dc: 1, dr: 0 },
  west:  { dc: -1, dr: 0 },
};

export function isInBounds(col: number, row: number): boolean {
  return col >= 1 && col <= 8 && row >= 1 && row <= 8;
}

export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

export function getAdjacent(pos: Position): Position[] {
  const results: Position[] = [];
  for (const { dc, dr } of Object.values(DIRECTION_OFFSETS)) {
    const nc = pos.col + dc;
    const nr = pos.row + dr;
    if (isInBounds(nc, nr)) {
      results.push(createPosition(nc, nr));
    }
  }
  return results;
}

export function getTilesInLine(
  from: Position,
  direction: Direction,
  maxDistance: number,
): Position[] {
  const results: Position[] = [];
  const { dc, dr } = DIRECTION_OFFSETS[direction];
  let col = from.col + dc;
  let row = from.row + dr;
  let count = 0;

  while (isInBounds(col, row) && count < maxDistance) {
    results.push(createPosition(col, row));
    col += dc;
    row += dr;
    count++;
  }
  return results;
}

export function getTilesInRange(center: Position, range: number): Position[] {
  const results: Position[] = [];
  for (let c = 1; c <= 8; c++) {
    for (let r = 1; r <= 8; r++) {
      const dist = Math.abs(c - center.col) + Math.abs(r - center.row);
      if (dist > 0 && dist <= range) {
        results.push(createPosition(c, r));
      }
    }
  }
  return results;
}

export function getDirectionBetween(from: Position, to: Position): Direction | null {
  const dc = to.col - from.col;
  const dr = to.row - from.row;
  if (dc === 0 && dr < 0) return 'north';
  if (dc === 0 && dr > 0) return 'south';
  if (dr === 0 && dc > 0) return 'east';
  if (dr === 0 && dc < 0) return 'west';
  return null; // not a straight line
}
