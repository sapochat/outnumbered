import { describe, it, expect } from 'vitest';
import { ATTACK_ABILITIES, UTILITY_ABILITIES } from '../../src/data/ability-pool.js';
import { AbilitySlot } from '../../src/game/types.js';

describe('Ability Pool', () => {
  it('has 3 attack abilities', () => {
    expect(ATTACK_ABILITIES).toHaveLength(3);
    for (const a of ATTACK_ABILITIES) {
      expect(a.slot).toBe(AbilitySlot.ATTACK);
    }
  });

  it('has 3 utility abilities', () => {
    expect(UTILITY_ABILITIES).toHaveLength(3);
    for (const a of UTILITY_ABILITIES) {
      expect(a.slot).toBe(AbilitySlot.UTILITY);
    }
  });

  it('Cleave does 2 damage at range 1', () => {
    const cleave = ATTACK_ABILITIES.find(a => a.name === 'Cleave')!;
    expect(cleave.damage).toBe(2);
    expect(cleave.range).toBe(1);
    expect(cleave.aoe).toBe('single');
  });

  it('Snipe has range 5', () => {
    const snipe = ATTACK_ABILITIES.find(a => a.name === 'Snipe')!;
    expect(snipe.range).toBe(5);
    expect(snipe.damage).toBe(1);
  });

  it('Arc is a line AoE at range 3', () => {
    const arc = ATTACK_ABILITIES.find(a => a.name === 'Arc')!;
    expect(arc.range).toBe(3);
    expect(arc.aoe).toBe('line');
  });

  it('Heal has heal effect', () => {
    const heal = UTILITY_ABILITIES.find(a => a.name === 'Heal')!;
    expect(heal.effect).toBe('heal');
    expect(heal.effectValue).toBe(2);
  });

  it('Dash has dash effect', () => {
    const dash = UTILITY_ABILITIES.find(a => a.name === 'Dash')!;
    expect(dash.effect).toBe('dash');
    expect(dash.effectValue).toBe(4);
  });

  it('Stun has pin effect with damage', () => {
    const stun = UTILITY_ABILITIES.find(a => a.name === 'Stun')!;
    expect(stun.effect).toBe('pin');
    expect(stun.damage).toBe(1);
  });
});
