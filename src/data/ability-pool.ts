import { type Ability, AbilitySlot } from '../game/types.js';

const CLEAVE: Ability = {
  name: 'Cleave',
  slot: AbilitySlot.ATTACK,
  range: 1,
  damage: 2,
  description: 'Melee attack dealing 2 damage',
  aoe: 'single',
};

const SNIPE: Ability = {
  name: 'Snipe',
  slot: AbilitySlot.ATTACK,
  range: 5,
  damage: 1,
  description: 'Long-range shot (5 tiles)',
  aoe: 'single',
};

const ARC: Ability = {
  name: 'Arc',
  slot: AbilitySlot.ATTACK,
  range: 3,
  damage: 1,
  description: 'Line attack hitting all enemies (range 3)',
  aoe: 'line',
};

const HEAL_ABILITY: Ability = {
  name: 'Heal',
  slot: AbilitySlot.UTILITY,
  range: 1,
  damage: 0,
  description: 'Restore 2 HP to self or adjacent ally',
  aoe: 'none',
  effect: 'heal',
  effectValue: 2,
};

const DASH: Ability = {
  name: 'Dash',
  slot: AbilitySlot.UTILITY,
  range: 0,
  damage: 0,
  description: 'Move up to 4 tiles in a straight line',
  aoe: 'none',
  effect: 'dash',
  effectValue: 4,
};

const STUN: Ability = {
  name: 'Stun',
  slot: AbilitySlot.UTILITY,
  range: 2,
  damage: 1,
  description: 'Deal 1 damage and pin enemy for 1 turn',
  aoe: 'single',
  effect: 'pin',
  effectValue: 1,
};

export const ATTACK_ABILITIES: Ability[] = [CLEAVE, SNIPE, ARC];
export const UTILITY_ABILITIES: Ability[] = [HEAL_ABILITY, DASH, STUN];
