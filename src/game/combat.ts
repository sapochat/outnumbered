import {
  type UnitState,
  type EnemyState,
  type Position,
  EnemyType,
  posEqual,
} from './types.js';
import { applyDamage } from './units.js';
import { applyEnemyDamage, createEnemy } from './enemies.js';
import { getAdjacent, getDirectionBetween, manhattanDistance } from './grid.js';

function hasAdjacentShield(target: Position, enemies: readonly EnemyState[]): boolean {
  const adjacent = getAdjacent(target);
  return enemies.some(
    e => e.enemyType === EnemyType.SHIELD && e.hp > 0 && adjacent.some(a => posEqual(a, e.position)),
  );
}

interface AbilityResult {
  enemies: EnemyState[];
  units: UnitState[];
}

export function executeAbility(
  unit: UnitState,
  abilityIndex: number,
  target: Position,
  units: readonly UnitState[],
  enemies: readonly EnemyState[],
): AbilityResult {
  const ability = unit.abilities[abilityIndex];
  let newEnemies = [...enemies];
  const newUnits = [...units];

  if (ability.damage > 0) {
    if (ability.aoe === 'line') {
      const dir = getDirectionBetween(unit.position, target);
      if (dir) {
        newEnemies = newEnemies.map(e => {
          if (
            getDirectionBetween(unit.position, e.position) === dir &&
            manhattanDistance(unit.position, e.position) <= ability.range
          ) {
            const shielded = hasAdjacentShield(e.position, newEnemies);
            const effectiveDamage = Math.max(0, ability.damage - (shielded ? 1 : 0));
            return applyEnemyDamage(e, effectiveDamage);
          }
          return e;
        });
      }
    } else {
      newEnemies = newEnemies.map(e => {
        if (!posEqual(e.position, target)) return e;
        const shielded = hasAdjacentShield(e.position, newEnemies);
        const effectiveDamage = Math.max(0, ability.damage - (shielded ? 1 : 0));
        return applyEnemyDamage(e, effectiveDamage);
      });
    }
  }

  if (ability.effect === 'push') {
    const pushDist = ability.effectValue ?? 2;
    const dir = getDirectionBetween(unit.position, target);
    if (dir) {
      newEnemies = newEnemies.map(e => {
        if (!posEqual(e.position, target)) return e;
        const dc = target.col - unit.position.col;
        const dr = target.row - unit.position.row;
        const normDc = dc === 0 ? 0 : dc / Math.abs(dc);
        const normDr = dr === 0 ? 0 : dr / Math.abs(dr);
        let newCol = e.position.col + normDc * pushDist;
        let newRow = e.position.row + normDr * pushDist;
        newCol = Math.max(1, Math.min(8, newCol));
        newRow = Math.max(1, Math.min(8, newRow));
        return { ...e, position: { col: newCol, row: newRow } };
      });
    }
  }

  if (ability.effect === 'pin') {
    newEnemies = newEnemies.map(e =>
      posEqual(e.position, target) ? { ...e, pinned: true } : e,
    );
  }

  return { enemies: newEnemies, units: newUnits };
}

interface ResolutionResult {
  enemies: EnemyState[];
  units: UnitState[];
  newSpawns: EnemyState[];
}

export function resolveEnemyIntents(
  enemies: readonly EnemyState[],
  units: readonly UnitState[],
): ResolutionResult {
  let newUnits = [...units];
  const newEnemies: EnemyState[] = [];
  const newSpawns: EnemyState[] = [];

  for (const enemy of enemies) {
    if (!enemy.intent) {
      newEnemies.push(enemy);
      continue;
    }

    let current = { ...enemy };

    for (const action of enemy.intent.actions) {
      switch (action.type) {
        case 'move':
          current = { ...current, position: action.target };
          break;
        case 'attack':
          newUnits = newUnits.map(u =>
            posEqual(u.position, action.target) ? applyDamage(u, action.damage) : u,
          );
          break;
        case 'spawn': {
          const adjacent = getAdjacent(current.position);
          const allOccupied = [
            ...enemies.map(e => e.position),
            ...units.map(u => u.position),
          ];
          const free = adjacent.find(
            pos => !allOccupied.some(o => posEqual(o, pos)),
          );
          if (free) {
            newSpawns.push(createEnemy(EnemyType.GRUNT, free));
          }
          current = { ...current, turnsSinceSpawn: 0 };
          break;
        }
        case 'idle':
          break;
        case 'buff':
          break;
      }
    }

    current = {
      ...current,
      intent: null,
      turnsSinceSpawn: current.turnsSinceSpawn + 1,
      pinned: false,
    };
    newEnemies.push(current);
  }

  const shouldBuff = enemies.some(e =>
    e.intent?.actions.some(a => a.type === 'buff'),
  );

  if (shouldBuff) {
    return {
      enemies: [...newEnemies, ...newSpawns].map(e =>
        e.enemyType === EnemyType.GRUNT ? { ...e, buffed: true } : e,
      ),
      units: newUnits,
      newSpawns,
    };
  }

  return {
    enemies: [...newEnemies, ...newSpawns],
    units: newUnits,
    newSpawns,
  };
}
