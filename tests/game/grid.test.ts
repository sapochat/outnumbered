import { describe, it, expect } from 'vitest';
import {
  manhattanDistance,
  getAdjacent,
  getTilesInLine,
  getTilesInRange,
  isInBounds,
} from '../../src/game/grid.js';
import { createPosition } from '../../src/game/types.js';

describe('Grid Utilities', () => {
  describe('manhattanDistance', () => {
    it('returns 0 for same position', () => {
      const pos = createPosition(3, 3);
      expect(manhattanDistance(pos, pos)).toBe(0);
    });

    it('returns correct distance for different positions', () => {
      expect(manhattanDistance(createPosition(1, 1), createPosition(4, 5))).toBe(7);
      expect(manhattanDistance(createPosition(3, 3), createPosition(5, 3))).toBe(2);
    });
  });

  describe('getAdjacent', () => {
    it('returns 4 neighbors for center tile', () => {
      const adj = getAdjacent(createPosition(4, 4));
      expect(adj).toHaveLength(4);
    });

    it('returns 2 neighbors for corner tile', () => {
      const adj = getAdjacent(createPosition(1, 1));
      expect(adj).toHaveLength(2);
    });

    it('returns 3 neighbors for edge tile', () => {
      const adj = getAdjacent(createPosition(1, 4));
      expect(adj).toHaveLength(3);
    });
  });

  describe('getTilesInLine', () => {
    it('returns tiles in a straight line (horizontal)', () => {
      const tiles = getTilesInLine(createPosition(2, 3), 'east', 3);
      expect(tiles).toEqual([
        { col: 3, row: 3 },
        { col: 4, row: 3 },
        { col: 5, row: 3 },
      ]);
    });

    it('stops at grid boundary', () => {
      const tiles = getTilesInLine(createPosition(7, 3), 'east', 5);
      expect(tiles).toEqual([{ col: 8, row: 3 }]);
    });
  });

  describe('getTilesInRange', () => {
    it('returns all tiles within manhattan distance', () => {
      const tiles = getTilesInRange(createPosition(1, 1), 1);
      expect(tiles).toHaveLength(2); // (2,1) and (1,2) — not (1,1) itself
    });

    it('returns correct count for center tile range 2', () => {
      const tiles = getTilesInRange(createPosition(4, 4), 2);
      // Diamond of radius 2, minus center: 4 at dist=1 + 8 at dist=2 = 12 tiles
      expect(tiles).toHaveLength(12);
    });
  });

  describe('isInBounds', () => {
    it('returns true for valid positions', () => {
      expect(isInBounds(1, 1)).toBe(true);
      expect(isInBounds(8, 8)).toBe(true);
      expect(isInBounds(4, 5)).toBe(true);
    });

    it('returns false for out-of-bounds', () => {
      expect(isInBounds(0, 1)).toBe(false);
      expect(isInBounds(9, 1)).toBe(false);
      expect(isInBounds(1, 0)).toBe(false);
      expect(isInBounds(1, 9)).toBe(false);
    });
  });
});
