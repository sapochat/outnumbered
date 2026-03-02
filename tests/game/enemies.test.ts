import { describe, it, expect } from 'vitest';
import { createEnemy, generateIntent } from '../../src/game/enemies.js';
import { EnemyType, type UnitState, UnitClass } from '../../src/game/types.js';
import { createPosition } from '../../src/game/types.js';
import { createUnit } from '../../src/game/units.js';

describe('Enemies', () => {
  describe('createEnemy', () => {
    it('creates a Grunt with correct stats', () => {
      const enemy = createEnemy(EnemyType.GRUNT, createPosition(5, 5));
      expect(enemy.enemyType).toBe(EnemyType.GRUNT);
      expect(enemy.hp).toBe(2);
      expect(enemy.maxHp).toBe(2);
      expect(enemy.intent).toBeNull();
    });

    it('creates an Archer with correct stats', () => {
      const enemy = createEnemy(EnemyType.ARCHER, createPosition(5, 5));
      expect(enemy.hp).toBe(2);
    });

    it('creates a Spawner with correct stats', () => {
      const enemy = createEnemy(EnemyType.SPAWNER, createPosition(5, 5));
      expect(enemy.hp).toBe(4);
    });
  });

  describe('generateIntent', () => {
    const playerUnits: UnitState[] = [
      createUnit(UnitClass.VANGUARD, createPosition(3, 3)),
    ];

    it('Grunt moves toward nearest player unit', () => {
      const grunt = createEnemy(EnemyType.GRUNT, createPosition(5, 3));
      const intent = generateIntent(grunt, playerUnits, []);
      expect(intent.actions[0]).toEqual({ type: 'move', target: { col: 4, row: 3 } });
    });

    it('Grunt attacks adjacent player', () => {
      const grunt = createEnemy(EnemyType.GRUNT, createPosition(4, 3));
      const intent = generateIntent(grunt, playerUnits, []);
      expect(intent.actions).toContainEqual(
        expect.objectContaining({ type: 'attack', damage: 1 })
      );
    });

    it('Archer attacks in a straight line toward player', () => {
      const archer = createEnemy(EnemyType.ARCHER, createPosition(6, 3));
      const intent = generateIntent(archer, playerUnits, []);
      expect(intent.actions).toContainEqual(
        expect.objectContaining({ type: 'attack' })
      );
    });

    it('Spawner generates spawn intent every 2 turns', () => {
      const spawner = { ...createEnemy(EnemyType.SPAWNER, createPosition(7, 7)), turnsSinceSpawn: 1 };
      const intent = generateIntent(spawner, playerUnits, []);
      expect(intent.actions).toContainEqual({ type: 'spawn' });
    });

    it('Spawner idles when not ready to spawn', () => {
      const spawner = createEnemy(EnemyType.SPAWNER, createPosition(7, 7));
      const intent = generateIntent(spawner, playerUnits, []);
      expect(intent.actions).toContainEqual({ type: 'idle' });
    });

    it('pinned enemy does not move', () => {
      const grunt = { ...createEnemy(EnemyType.GRUNT, createPosition(5, 3)), pinned: true };
      const intent = generateIntent(grunt, playerUnits, []);
      const moveActions = intent.actions.filter(a => a.type === 'move');
      expect(moveActions).toHaveLength(0);
    });
  });
});
