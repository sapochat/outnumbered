import {
  type RunState,
  type FloorState,
  GamePhase,
  UnitClass,
  createPosition,
} from './types.js';
import { createUnit, resetUnitTurn, isUnitAlive } from './units.js';
import { generateIntent, isEnemyAlive } from './enemies.js';
import { resolveEnemyIntents } from './combat.js';
import { generateFloorEnemies } from './floor.js';

export function createNewRun(startingClass: UnitClass): RunState {
  const unit = createUnit(startingClass, createPosition(2, 4));
  const floor = createFloor(1);
  return {
    units: [unit],
    floor,
    score: 0,
    phase: GamePhase.ENEMY_INTENT,
    selectedUnitIndex: 0,
    cursorPosition: unit.position,
  };
}

function createFloor(floorNumber: number): FloorState {
  return {
    floorNumber,
    turn: 1,
    enemies: generateFloorEnemies(floorNumber),
  };
}

export function advancePhase(run: RunState): RunState {
  switch (run.phase) {
    case GamePhase.ENEMY_INTENT: {
      const enemies = run.floor.enemies.map(e =>
        ({ ...e, intent: generateIntent(e, run.units, run.floor.enemies) }),
      );
      return {
        ...run,
        phase: GamePhase.PLAYER_ACTION,
        floor: { ...run.floor, enemies },
        units: run.units.map(u => resetUnitTurn(u)),
      };
    }
    case GamePhase.PLAYER_ACTION: {
      return { ...run, phase: GamePhase.RESOLUTION };
    }
    case GamePhase.RESOLUTION: {
      const result = resolveEnemyIntents(run.floor.enemies, run.units);
      const aliveEnemies = result.enemies.filter(isEnemyAlive);
      const aliveUnits = result.units.filter(isUnitAlive);
      const killedCount = run.floor.enemies.length - aliveEnemies.length + result.newSpawns.length;
      return {
        ...run,
        phase: GamePhase.ENEMY_INTENT,
        floor: {
          ...run.floor,
          turn: run.floor.turn + 1,
          enemies: aliveEnemies,
        },
        units: aliveUnits,
        score: run.score + killedCount * 10,
      };
    }
  }
}

export function isFloorCleared(run: RunState): boolean {
  return run.floor.enemies.length === 0;
}

export function isGameOver(run: RunState): boolean {
  return run.units.every(u => u.hp <= 0);
}

export function advanceToNextFloor(run: RunState): RunState {
  const nextFloorNumber = run.floor.floorNumber + 1;
  return {
    ...run,
    floor: createFloor(nextFloorNumber),
    phase: GamePhase.ENEMY_INTENT,
    score: run.score + 50,
  };
}

export function isRunWon(run: RunState): boolean {
  return run.floor.floorNumber === 10 && isFloorCleared(run);
}
