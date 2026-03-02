import { type UnitState, type Position, UnitClass } from './types.js';
import { UNIT_CLASS_DEFS } from '../data/unit-defs.js';

let nextUnitId = 1;

export function createUnit(unitClass: UnitClass, position: Position): UnitState {
  const def = UNIT_CLASS_DEFS[unitClass];
  return {
    id: `unit-${nextUnitId++}`,
    unitClass,
    position,
    hp: def.hp,
    maxHp: def.hp,
    moveRange: def.moveRange,
    abilities: [def.abilities[0], def.abilities[1]],
    hasMoved: false,
    hasActed: false,
  };
}

export function applyDamage(unit: UnitState, damage: number): UnitState {
  return { ...unit, hp: Math.max(0, unit.hp - damage) };
}

export function healUnit(unit: UnitState): UnitState {
  return { ...unit, hp: unit.maxHp };
}

export function moveUnit(unit: UnitState, to: Position): UnitState {
  return { ...unit, position: to, hasMoved: true };
}

export function resetUnitTurn(unit: UnitState): UnitState {
  return { ...unit, hasMoved: false, hasActed: false };
}

export function markActed(unit: UnitState): UnitState {
  return { ...unit, hasActed: true };
}

export function isUnitAlive(unit: UnitState): boolean {
  return unit.hp > 0;
}
