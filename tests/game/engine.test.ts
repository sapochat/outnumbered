import { describe, it, expect } from 'vitest';
import { createNewRun, advancePhase, isFloorCleared, isGameOver, advanceToNextFloor, isRunWon } from '../../src/game/engine.js';
import { GamePhase, UnitClass } from '../../src/game/types.js';

describe('Game Engine', () => {
  describe('createNewRun', () => {
    it('creates a run starting at floor 1 with one unit', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      expect(run.floor.floorNumber).toBe(1);
      expect(run.units).toHaveLength(1);
      expect(run.units[0].unitClass).toBe(UnitClass.VANGUARD);
      expect(run.phase).toBe(GamePhase.ENEMY_INTENT);
      expect(run.score).toBe(0);
    });

    it('places unit on the left side of the grid', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      expect(run.units[0].position.col).toBeLessThanOrEqual(4);
    });

    it('generates enemies for floor 1', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      expect(run.floor.enemies.length).toBeGreaterThan(0);
    });
  });

  describe('advancePhase', () => {
    it('cycles: enemy_intent -> player_action', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      expect(run.phase).toBe(GamePhase.ENEMY_INTENT);
      const run2 = advancePhase(run);
      expect(run2.phase).toBe(GamePhase.PLAYER_ACTION);
    });

    it('cycles: player_action -> resolution', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const run2 = advancePhase(run); // -> PLAYER_ACTION
      const run3 = advancePhase(run2); // -> RESOLUTION
      expect(run3.phase).toBe(GamePhase.RESOLUTION);
    });

    it('cycles: resolution -> enemy_intent (next turn)', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const run2 = advancePhase(run);  // -> PLAYER_ACTION
      const run3 = advancePhase(run2); // -> RESOLUTION
      const run4 = advancePhase(run3); // -> ENEMY_INTENT
      expect(run4.phase).toBe(GamePhase.ENEMY_INTENT);
      expect(run4.floor.turn).toBe(2);
    });

    it('enemy_intent phase generates intents for enemies', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const afterIntent = advancePhase(run);
      // After enemy intent phase, enemies should have intents
      expect(afterIntent.floor.enemies.some(e => e.intent !== null)).toBe(true);
    });

    it('enemy_intent phase resets unit turn flags', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const afterIntent = advancePhase(run);
      expect(afterIntent.units.every(u => !u.hasMoved && !u.hasActed)).toBe(true);
    });
  });

  describe('isFloorCleared', () => {
    it('returns true when no enemies remain', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const clearedRun = { ...run, floor: { ...run.floor, enemies: [] } };
      expect(isFloorCleared(clearedRun)).toBe(true);
    });

    it('returns false when enemies remain', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      expect(isFloorCleared(run)).toBe(false);
    });
  });

  describe('isGameOver', () => {
    it('returns true when all units are dead', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const deadRun = { ...run, units: run.units.map(u => ({ ...u, hp: 0 })) };
      expect(isGameOver(deadRun)).toBe(true);
    });

    it('returns false when at least one unit is alive', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      expect(isGameOver(run)).toBe(false);
    });
  });

  describe('advanceToNextFloor', () => {
    it('increments floor number', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const next = advanceToNextFloor(run);
      expect(next.floor.floorNumber).toBe(2);
    });

    it('adds floor clear bonus to score', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const next = advanceToNextFloor(run);
      expect(next.score).toBeGreaterThan(run.score);
    });

    it('resets to ENEMY_INTENT phase', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const next = advanceToNextFloor(run);
      expect(next.phase).toBe(GamePhase.ENEMY_INTENT);
    });
  });

  describe('isRunWon', () => {
    it('returns true when floor 10 is cleared', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const wonRun = {
        ...run,
        floor: { ...run.floor, floorNumber: 10, enemies: [] },
      };
      expect(isRunWon(wonRun)).toBe(true);
    });

    it('returns false when not on floor 10', () => {
      const run = createNewRun(UnitClass.VANGUARD);
      const clearedRun = { ...run, floor: { ...run.floor, enemies: [] } };
      expect(isRunWon(clearedRun)).toBe(false);
    });
  });
});
