import { type Ability, UnitClass, AbilitySlot } from '../game/types.js';

export interface UnitClassDef {
  readonly unitClass: UnitClass;
  readonly hp: number;
  readonly moveRange: number;
  readonly abilities: readonly [Ability, Ability];
}

const SLASH: Ability = {
  name: 'Slash',
  slot: AbilitySlot.ATTACK,
  range: 1,
  damage: 1,
  description: 'Melee attack on adjacent tile',
  aoe: 'single',
};

const SHOVE: Ability = {
  name: 'Shove',
  slot: AbilitySlot.UTILITY,
  range: 1,
  damage: 0,
  description: 'Push enemy 2 tiles away',
  aoe: 'none',
  effect: 'push',
  effectValue: 2,
};

const SHOOT: Ability = {
  name: 'Shoot',
  slot: AbilitySlot.ATTACK,
  range: 3,
  damage: 1,
  description: 'Ranged attack up to 3 tiles',
  aoe: 'single',
};

const PIN: Ability = {
  name: 'Pin',
  slot: AbilitySlot.UTILITY,
  range: 3,
  damage: 0,
  description: 'Immobilize enemy for 1 turn',
  aoe: 'none',
  effect: 'pin',
  effectValue: 1,
};

const BOLT: Ability = {
  name: 'Bolt',
  slot: AbilitySlot.ATTACK,
  range: 2,
  damage: 1,
  description: 'Hits all enemies in a straight line (range 2)',
  aoe: 'line',
};

const WARP: Ability = {
  name: 'Warp',
  slot: AbilitySlot.UTILITY,
  range: 0,
  damage: 0,
  description: 'Teleport to any empty tile',
  aoe: 'none',
  effect: 'teleport',
};

export const UNIT_CLASS_DEFS: Record<UnitClass, UnitClassDef> = {
  [UnitClass.VANGUARD]: { unitClass: UnitClass.VANGUARD, hp: 6, moveRange: 2, abilities: [SLASH, SHOVE] },
  [UnitClass.RANGER]:   { unitClass: UnitClass.RANGER,   hp: 4, moveRange: 3, abilities: [SHOOT, PIN] },
  [UnitClass.ARCANIST]:  { unitClass: UnitClass.ARCANIST,  hp: 3, moveRange: 3, abilities: [BOLT, WARP] },
};
