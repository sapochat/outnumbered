import { describe, it, expect } from 'vitest';
import { generateFloorEnemies } from '../../src/game/floor.js';
import { EnemyType } from '../../src/game/types.js';

describe('Floor Generation', () => {
  it('floor 1 spawns only grunts', () => {
    const enemies = generateFloorEnemies(1);
    expect(enemies.length).toBeGreaterThanOrEqual(3);
    expect(enemies.every(e => e.enemyType === EnemyType.GRUNT)).toBe(true);
  });

  it('floors scale in difficulty (more enemies)', () => {
    const floor1 = generateFloorEnemies(1);
    const floor8 = generateFloorEnemies(8);
    expect(floor8.length).toBeGreaterThan(floor1.length);
  });

  it('floor 5 includes a boss', () => {
    const enemies = generateFloorEnemies(5);
    expect(enemies.some(e => e.enemyType === EnemyType.BOSS)).toBe(true);
  });

  it('floor 10 includes a boss', () => {
    const enemies = generateFloorEnemies(10);
    expect(enemies.some(e => e.enemyType === EnemyType.BOSS)).toBe(true);
  });

  it('enemies are placed in the right half of the grid (cols 5-8)', () => {
    const enemies = generateFloorEnemies(3);
    expect(enemies.every(e => e.position.col >= 5)).toBe(true);
  });

  it('no two enemies share a position', () => {
    // Run multiple times to test randomness
    for (let i = 0; i < 10; i++) {
      const enemies = generateFloorEnemies(7);
      const positions = enemies.map(e => `${e.position.col},${e.position.row}`);
      expect(new Set(positions).size).toBe(positions.length);
    }
  });
});
