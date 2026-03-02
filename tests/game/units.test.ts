import { describe, it, expect } from 'vitest';
import { createUnit, applyDamage, healUnit, resetUnitTurn } from '../../src/game/units.js';
import { UnitClass, AbilitySlot } from '../../src/game/types.js';
import { createPosition } from '../../src/game/types.js';

describe('Units', () => {
  describe('createUnit', () => {
    it('creates a Vanguard with correct stats', () => {
      const unit = createUnit(UnitClass.VANGUARD, createPosition(3, 3));
      expect(unit.unitClass).toBe(UnitClass.VANGUARD);
      expect(unit.hp).toBe(6);
      expect(unit.maxHp).toBe(6);
      expect(unit.moveRange).toBe(2);
      expect(unit.abilities[0].name).toBe('Slash');
      expect(unit.abilities[0].slot).toBe(AbilitySlot.ATTACK);
      expect(unit.abilities[1].name).toBe('Shove');
      expect(unit.abilities[1].slot).toBe(AbilitySlot.UTILITY);
    });

    it('creates a Ranger with correct stats', () => {
      const unit = createUnit(UnitClass.RANGER, createPosition(1, 1));
      expect(unit.hp).toBe(4);
      expect(unit.moveRange).toBe(3);
      expect(unit.abilities[0].name).toBe('Shoot');
      expect(unit.abilities[1].name).toBe('Pin');
    });

    it('creates an Arcanist with correct stats', () => {
      const unit = createUnit(UnitClass.ARCANIST, createPosition(1, 1));
      expect(unit.hp).toBe(3);
      expect(unit.moveRange).toBe(3);
      expect(unit.abilities[0].name).toBe('Bolt');
      expect(unit.abilities[1].name).toBe('Warp');
    });
  });

  describe('applyDamage', () => {
    it('reduces HP', () => {
      const unit = createUnit(UnitClass.VANGUARD, createPosition(3, 3));
      const damaged = applyDamage(unit, 2);
      expect(damaged.hp).toBe(4);
    });

    it('does not go below 0', () => {
      const unit = createUnit(UnitClass.ARCANIST, createPosition(1, 1));
      const dead = applyDamage(unit, 10);
      expect(dead.hp).toBe(0);
    });
  });

  describe('healUnit', () => {
    it('restores HP up to max', () => {
      const unit = createUnit(UnitClass.VANGUARD, createPosition(3, 3));
      const damaged = applyDamage(unit, 4);
      const healed = healUnit(damaged);
      expect(healed.hp).toBe(6);
    });
  });

  describe('resetUnitTurn', () => {
    it('resets hasMoved and hasActed', () => {
      const unit = { ...createUnit(UnitClass.VANGUARD, createPosition(3, 3)), hasMoved: true, hasActed: true };
      const reset = resetUnitTurn(unit);
      expect(reset.hasMoved).toBe(false);
      expect(reset.hasActed).toBe(false);
    });
  });
});
