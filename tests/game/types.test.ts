import { describe, it, expect } from 'vitest';
import {
  type Position,
  type UnitState,
  type EnemyState,
  type GameState,
  createPosition,
  GamePhase,
  UnitClass,
  EnemyType,
  AbilitySlot,
} from '../../src/game/types.js';

describe('Core Types', () => {
  it('creates a valid position', () => {
    const pos = createPosition(3, 4);
    expect(pos).toEqual({ col: 3, row: 4 });
  });

  it('rejects out-of-bounds positions', () => {
    expect(() => createPosition(0, 1)).toThrow();
    expect(() => createPosition(9, 1)).toThrow();
    expect(() => createPosition(1, 0)).toThrow();
    expect(() => createPosition(1, 9)).toThrow();
  });

  it('has all game phases', () => {
    expect(GamePhase.ENEMY_INTENT).toBe('enemy_intent');
    expect(GamePhase.PLAYER_ACTION).toBe('player_action');
    expect(GamePhase.RESOLUTION).toBe('resolution');
  });

  it('has all unit classes', () => {
    expect(UnitClass.VANGUARD).toBe('vanguard');
    expect(UnitClass.RANGER).toBe('ranger');
    expect(UnitClass.ARCANIST).toBe('arcanist');
  });

  it('has all enemy types', () => {
    expect(EnemyType.GRUNT).toBe('grunt');
    expect(EnemyType.ARCHER).toBe('archer');
    expect(EnemyType.SPAWNER).toBe('spawner');
    expect(EnemyType.CHARGER).toBe('charger');
    expect(EnemyType.SHIELD).toBe('shield');
    expect(EnemyType.WARLORD).toBe('warlord');
    expect(EnemyType.QUEEN).toBe('queen');
  });
});
