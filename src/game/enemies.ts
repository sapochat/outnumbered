import {
  type EnemyState,
  type UnitState,
  type Intent,
  type IntentAction,
  type Position,
  EnemyType,
  posEqual,
} from './types.js';
import { manhattanDistance, getAdjacent, getDirectionBetween } from './grid.js';
import { ENEMY_TYPE_DEFS } from '../data/enemy-defs.js';

let nextEnemyId = 1;

export function createEnemy(enemyType: EnemyType, position: Position): EnemyState {
  const def = ENEMY_TYPE_DEFS[enemyType];
  return {
    id: `enemy-${nextEnemyId++}`,
    enemyType,
    position,
    hp: def.hp,
    maxHp: def.hp,
    intent: null,
    turnsSinceSpawn: 0,
    pinned: false,
  };
}

function findNearestUnit(from: Position, units: readonly UnitState[]): UnitState | null {
  let nearest: UnitState | null = null;
  let minDist = Infinity;
  for (const unit of units) {
    if (unit.hp <= 0) continue;
    const dist = manhattanDistance(from, unit.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = unit;
    }
  }
  return nearest;
}

function stepToward(from: Position, to: Position, occupied: readonly Position[]): Position {
  const candidates = getAdjacent(from);
  let best: Position = from;
  let bestDist = manhattanDistance(from, to);
  for (const c of candidates) {
    if (occupied.some(o => posEqual(o, c))) continue;
    const dist = manhattanDistance(c, to);
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

function gruntIntent(enemy: EnemyState, units: readonly UnitState[], occupied: readonly Position[]): Intent {
  const nearest = findNearestUnit(enemy.position, units);
  if (!nearest) return { actions: [{ type: 'idle' }] };

  const dist = manhattanDistance(enemy.position, nearest.position);
  const actions: IntentAction[] = [];

  if (enemy.pinned) {
    if (dist === 1) {
      actions.push({ type: 'attack', target: nearest.position, damage: 1 });
    } else {
      actions.push({ type: 'idle' });
    }
  } else if (dist === 1) {
    actions.push({ type: 'attack', target: nearest.position, damage: 1 });
  } else {
    const moveTarget = stepToward(enemy.position, nearest.position, occupied);
    actions.push({ type: 'move', target: moveTarget });
    if (manhattanDistance(moveTarget, nearest.position) === 1) {
      actions.push({ type: 'attack', target: nearest.position, damage: 1 });
    }
  }

  return { actions };
}

function archerIntent(enemy: EnemyState, units: readonly UnitState[]): Intent {
  const nearest = findNearestUnit(enemy.position, units);
  if (!nearest) return { actions: [{ type: 'idle' }] };

  const direction = getDirectionBetween(enemy.position, nearest.position);
  if (direction && manhattanDistance(enemy.position, nearest.position) <= 3) {
    return { actions: [{ type: 'attack', target: nearest.position, damage: 1 }] };
  }
  return { actions: [{ type: 'idle' }] };
}

function spawnerIntent(enemy: EnemyState): Intent {
  if (enemy.pinned) return { actions: [{ type: 'idle' }] };
  if (enemy.turnsSinceSpawn >= 1) {
    return { actions: [{ type: 'spawn' }] };
  }
  return { actions: [{ type: 'idle' }] };
}

export function generateIntent(
  enemy: EnemyState,
  units: readonly UnitState[],
  allEnemyPositions: readonly Position[],
): Intent {
  const occupied = allEnemyPositions.filter(p => !posEqual(p, enemy.position));
  switch (enemy.enemyType) {
    case EnemyType.GRUNT:   return gruntIntent(enemy, units, occupied);
    case EnemyType.ARCHER:  return archerIntent(enemy, units);
    case EnemyType.SPAWNER: return spawnerIntent(enemy);
    case EnemyType.BOSS:    return gruntIntent(enemy, units, occupied); // Boss uses grunt AI for v1
  }
}

export function applyEnemyDamage(enemy: EnemyState, damage: number): EnemyState {
  return { ...enemy, hp: Math.max(0, enemy.hp - damage) };
}

export function isEnemyAlive(enemy: EnemyState): boolean {
  return enemy.hp > 0;
}
