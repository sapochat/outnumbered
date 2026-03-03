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
      const intent = generateIntent(grunt, playerUnits, [grunt]);
      expect(intent.actions[0]).toEqual({ type: 'move', target: { col: 4, row: 3 } });
    });

    it('Grunt attacks adjacent player', () => {
      const grunt = createEnemy(EnemyType.GRUNT, createPosition(4, 3));
      const intent = generateIntent(grunt, playerUnits, [grunt]);
      expect(intent.actions).toContainEqual(
        expect.objectContaining({ type: 'attack', damage: 1 })
      );
    });

    it('Archer attacks in a straight line toward player', () => {
      const archer = createEnemy(EnemyType.ARCHER, createPosition(6, 3));
      const intent = generateIntent(archer, playerUnits, [archer]);
      expect(intent.actions).toContainEqual(
        expect.objectContaining({ type: 'attack' })
      );
    });

    it('Spawner generates spawn intent every 2 turns', () => {
      const spawner = { ...createEnemy(EnemyType.SPAWNER, createPosition(7, 7)), turnsSinceSpawn: 1 };
      const intent = generateIntent(spawner, playerUnits, [spawner]);
      expect(intent.actions).toContainEqual({ type: 'spawn' });
    });

    it('Spawner idles when not ready to spawn', () => {
      const spawner = createEnemy(EnemyType.SPAWNER, createPosition(7, 7));
      const intent = generateIntent(spawner, playerUnits, [spawner]);
      expect(intent.actions).toContainEqual({ type: 'idle' });
    });

    it('pinned enemy does not move', () => {
      const grunt = { ...createEnemy(EnemyType.GRUNT, createPosition(5, 3)), pinned: true };
      const intent = generateIntent(grunt, playerUnits, [grunt]);
      const moveActions = intent.actions.filter(a => a.type === 'move');
      expect(moveActions).toHaveLength(0);
    });

    it('Charger charges toward nearest player in cardinal direction', () => {
      const charger = createEnemy(EnemyType.CHARGER, createPosition(6, 3));
      const intent = generateIntent(charger, playerUnits, [charger]);
      expect(intent.actions[0]).toEqual(
        expect.objectContaining({ type: 'move' })
      );
      expect(intent.dangerTiles).toBeDefined();
      expect(intent.dangerTiles!.length).toBeGreaterThan(0);
    });

    it('Charger attacks player in its charge path', () => {
      const charger = createEnemy(EnemyType.CHARGER, createPosition(5, 3));
      const intent = generateIntent(charger, playerUnits, [charger]);
      const attackAction = intent.actions.find(a => a.type === 'attack');
      expect(attackAction).toBeDefined();
      if (attackAction && attackAction.type === 'attack') {
        expect(attackAction.damage).toBe(2);
      }
    });

    it('pinned Charger idles', () => {
      const charger = { ...createEnemy(EnemyType.CHARGER, createPosition(6, 3)), pinned: true };
      const intent = generateIntent(charger, playerUnits, [charger]);
      expect(intent.actions).toContainEqual({ type: 'idle' });
    });

    it('Shield moves toward lowest-HP ally', () => {
      const grunt = { ...createEnemy(EnemyType.GRUNT, createPosition(7, 3)), hp: 1 };
      const shield = createEnemy(EnemyType.SHIELD, createPosition(5, 3));
      const intent = generateIntent(shield, playerUnits, [shield, grunt]);
      expect(intent.actions[0]).toEqual(
        expect.objectContaining({ type: 'move' })
      );
      if (intent.actions[0].type === 'move') {
        expect(intent.actions[0].target.col).toBe(6);
      }
    });

    it('Shield idles when already adjacent to ally', () => {
      const grunt = createEnemy(EnemyType.GRUNT, createPosition(6, 3));
      const shield = createEnemy(EnemyType.SHIELD, createPosition(5, 3));
      const intent = generateIntent(shield, playerUnits, [shield, grunt]);
      expect(intent.actions).toContainEqual({ type: 'idle' });
    });

    describe('Warlord', () => {
      it('attacks for 2 damage when adjacent', () => {
        const warlord = createEnemy(EnemyType.WARLORD, createPosition(4, 3));
        const intent = generateIntent(warlord, playerUnits, [warlord]);
        const attack = intent.actions.find(a => a.type === 'attack');
        expect(attack).toBeDefined();
        if (attack && attack.type === 'attack') {
          expect(attack.damage).toBe(2);
        }
      });

      it('war cries every 3 turns', () => {
        const warlord = { ...createEnemy(EnemyType.WARLORD, createPosition(6, 3)), turnsSinceSpawn: 2 };
        const intent = generateIntent(warlord, playerUnits, [warlord]);
        expect(intent.actions).toContainEqual({ type: 'buff' });
      });

      it('does not war cry on other turns', () => {
        const warlord = { ...createEnemy(EnemyType.WARLORD, createPosition(6, 3)), turnsSinceSpawn: 1 };
        const intent = generateIntent(warlord, playerUnits, [warlord]);
        expect(intent.actions).not.toContainEqual({ type: 'buff' });
      });

      it('moves 2 tiles when enraged (below 50% HP)', () => {
        const warlord = { ...createEnemy(EnemyType.WARLORD, createPosition(8, 3)), hp: 4 };
        const intent = generateIntent(warlord, playerUnits, [warlord]);
        const moveAction = intent.actions.find(a => a.type === 'move');
        expect(moveAction).toBeDefined();
        if (moveAction && moveAction.type === 'move') {
          expect(moveAction.target.col).toBe(6);
        }
      });
    });

    it('buffed Grunt attacks for 2 damage', () => {
      const grunt = { ...createEnemy(EnemyType.GRUNT, createPosition(4, 3)), buffed: true };
      const intent = generateIntent(grunt, playerUnits, [grunt]);
      const attack = intent.actions.find(a => a.type === 'attack');
      expect(attack).toBeDefined();
      if (attack && attack.type === 'attack') {
        expect(attack.damage).toBe(2);
      }
    });

    describe('Queen', () => {
      it('fires line attack toward nearest player when in cardinal line', () => {
        const queen = createEnemy(EnemyType.QUEEN, createPosition(6, 3));
        const intent = generateIntent(queen, playerUnits, [queen]);
        const attacks = intent.actions.filter(a => a.type === 'attack');
        expect(attacks.length).toBeGreaterThan(0);
      });

      it('spawns grunt every 2 turns in phase 1', () => {
        const queen = { ...createEnemy(EnemyType.QUEEN, createPosition(6, 6)), turnsSinceSpawn: 1 };
        const intent = generateIntent(queen, playerUnits, [queen]);
        expect(intent.actions).toContainEqual({ type: 'spawn' });
      });

      it('does not spawn on off-turns in phase 1', () => {
        const queen = createEnemy(EnemyType.QUEEN, createPosition(6, 6));
        const intent = generateIntent(queen, playerUnits, [queen]);
        expect(intent.actions).not.toContainEqual({ type: 'spawn' });
      });

      it('spawns every turn in phase 2 (below 50% HP)', () => {
        const queen = { ...createEnemy(EnemyType.QUEEN, createPosition(6, 6)), hp: 7, turnsSinceSpawn: 0 };
        const intent = generateIntent(queen, playerUnits, [queen]);
        expect(intent.actions).toContainEqual({ type: 'spawn' });
      });

      it('uses cross AoE in phase 2', () => {
        const queen = { ...createEnemy(EnemyType.QUEEN, createPosition(6, 6)), hp: 7, turnsSinceSpawn: 1 };
        const intent = generateIntent(queen, playerUnits, [queen]);
        const attacks = intent.actions.filter(a => a.type === 'attack');
        expect(attacks.length).toBeGreaterThanOrEqual(4);
      });

      it('never moves', () => {
        const queen = createEnemy(EnemyType.QUEEN, createPosition(6, 6));
        const intent = generateIntent(queen, playerUnits, [queen]);
        const moves = intent.actions.filter(a => a.type === 'move');
        expect(moves).toHaveLength(0);
      });
    });
  });
});
