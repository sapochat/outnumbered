import { describe, it, expect } from 'vitest';
import { executeAbility, resolveEnemyIntents } from '../../src/game/combat.js';
import { createUnit } from '../../src/game/units.js';
import { createEnemy } from '../../src/game/enemies.js';
import { createPosition, UnitClass, EnemyType, type EnemyState } from '../../src/game/types.js';

describe('Combat', () => {
  describe('executeAbility', () => {
    it('Slash deals 1 damage to adjacent enemy', () => {
      const unit = createUnit(UnitClass.VANGUARD, createPosition(3, 3));
      const enemy = createEnemy(EnemyType.GRUNT, createPosition(4, 3));
      const result = executeAbility(unit, 0, createPosition(4, 3), [], [enemy]);
      expect(result.enemies[0].hp).toBe(1); // 2 - 1 = 1
    });

    it('Shove pushes enemy 2 tiles', () => {
      const unit = createUnit(UnitClass.VANGUARD, createPosition(3, 3));
      const enemy = createEnemy(EnemyType.GRUNT, createPosition(4, 3));
      const result = executeAbility(unit, 1, createPosition(4, 3), [], [enemy]);
      expect(result.enemies[0].position).toEqual({ col: 6, row: 3 });
    });

    it('Shove stops at grid boundary', () => {
      const unit = createUnit(UnitClass.VANGUARD, createPosition(6, 3));
      const enemy = createEnemy(EnemyType.GRUNT, createPosition(7, 3));
      const result = executeAbility(unit, 1, createPosition(7, 3), [], [enemy]);
      expect(result.enemies[0].position.col).toBeLessThanOrEqual(8);
    });

    it('Shoot deals 1 damage at range', () => {
      const unit = createUnit(UnitClass.RANGER, createPosition(1, 3));
      const enemy = createEnemy(EnemyType.GRUNT, createPosition(4, 3));
      const result = executeAbility(unit, 0, createPosition(4, 3), [], [enemy]);
      expect(result.enemies[0].hp).toBe(1);
    });

    it('Pin immobilizes enemy', () => {
      const unit = createUnit(UnitClass.RANGER, createPosition(1, 3));
      const enemy = createEnemy(EnemyType.GRUNT, createPosition(3, 3));
      const result = executeAbility(unit, 1, createPosition(3, 3), [], [enemy]);
      expect(result.enemies[0].pinned).toBe(true);
    });

    it('Bolt hits all enemies in a line', () => {
      const unit = createUnit(UnitClass.ARCANIST, createPosition(1, 3));
      const enemy1 = createEnemy(EnemyType.GRUNT, createPosition(2, 3));
      const enemy2 = createEnemy(EnemyType.GRUNT, createPosition(3, 3));
      const result = executeAbility(unit, 0, createPosition(2, 3), [], [enemy1, enemy2]);
      expect(result.enemies[0].hp).toBe(1);
      expect(result.enemies[1].hp).toBe(1);
    });

    it('Shield reduces damage to adjacent ally by 1', () => {
      const unit = createUnit(UnitClass.VANGUARD, createPosition(3, 3));
      const grunt = createEnemy(EnemyType.GRUNT, createPosition(4, 3));
      const shield = createEnemy(EnemyType.SHIELD, createPosition(5, 3));
      const result = executeAbility(unit, 0, createPosition(4, 3), [unit], [grunt, shield]);
      expect(result.enemies[0].hp).toBe(2); // 1 damage - 1 shield = 0
    });

    it('Shield does not reduce damage if not adjacent', () => {
      const unit = createUnit(UnitClass.VANGUARD, createPosition(3, 3));
      const grunt = createEnemy(EnemyType.GRUNT, createPosition(4, 3));
      const shield = createEnemy(EnemyType.SHIELD, createPosition(7, 7));
      const result = executeAbility(unit, 0, createPosition(4, 3), [unit], [grunt, shield]);
      expect(result.enemies[0].hp).toBe(1); // normal 1 damage
    });
  });

  describe('resolveEnemyIntents', () => {
    it('Grunt moves to its intent target', () => {
      const enemy: EnemyState = {
        ...createEnemy(EnemyType.GRUNT, createPosition(5, 3)),
        intent: { actions: [{ type: 'move', target: createPosition(4, 3) }] },
      };
      const result = resolveEnemyIntents([enemy], [createUnit(UnitClass.VANGUARD, createPosition(3, 3))]);
      expect(result.enemies[0].position).toEqual({ col: 4, row: 3 });
    });

    it('Grunt deals damage on attack intent', () => {
      const enemy: EnemyState = {
        ...createEnemy(EnemyType.GRUNT, createPosition(4, 3)),
        intent: { actions: [{ type: 'attack', target: createPosition(3, 3), damage: 1 }] },
      };
      const unit = createUnit(UnitClass.VANGUARD, createPosition(3, 3));
      const result = resolveEnemyIntents([enemy], [unit]);
      expect(result.units[0].hp).toBe(5); // 6 - 1 = 5
    });

    it('Spawner creates a new Grunt', () => {
      const spawner: EnemyState = {
        ...createEnemy(EnemyType.SPAWNER, createPosition(5, 5)),
        turnsSinceSpawn: 1,
        intent: { actions: [{ type: 'spawn' }] },
      };
      const result = resolveEnemyIntents([spawner], []);
      expect(result.enemies.length).toBe(2); // spawner + new grunt
      expect(result.enemies[1].enemyType).toBe(EnemyType.GRUNT);
    });

    it('clears intents and pin after resolution', () => {
      const enemy: EnemyState = {
        ...createEnemy(EnemyType.GRUNT, createPosition(5, 3)),
        pinned: true,
        intent: { actions: [{ type: 'idle' }] },
      };
      const result = resolveEnemyIntents([enemy], []);
      expect(result.enemies[0].intent).toBeNull();
      expect(result.enemies[0].pinned).toBe(false);
    });

    it('buff action sets buffed on all grunts', () => {
      const warlord: EnemyState = {
        ...createEnemy(EnemyType.WARLORD, createPosition(7, 7)),
        intent: { actions: [{ type: 'buff' }] },
      };
      const grunt: EnemyState = {
        ...createEnemy(EnemyType.GRUNT, createPosition(5, 5)),
        intent: { actions: [{ type: 'idle' }] },
      };
      const result = resolveEnemyIntents([warlord, grunt], []);
      const resolvedGrunt = result.enemies.find(e => e.enemyType === EnemyType.GRUNT);
      expect(resolvedGrunt?.buffed).toBe(true);
    });
  });
});
