import { EnemyType } from '../game/types.js';

export interface FloorComposition {
  readonly enemies: { type: EnemyType; count: number }[];
}

export const FLOOR_TABLES: Record<number, FloorComposition> = {
  1:  { enemies: [{ type: EnemyType.GRUNT, count: 3 }] },
  2:  { enemies: [{ type: EnemyType.GRUNT, count: 4 }] },
  3:  { enemies: [{ type: EnemyType.GRUNT, count: 3 }, { type: EnemyType.ARCHER, count: 1 }] },
  4:  { enemies: [{ type: EnemyType.GRUNT, count: 3 }, { type: EnemyType.ARCHER, count: 1 }, { type: EnemyType.SPAWNER, count: 1 }] },
  5:  { enemies: [{ type: EnemyType.BOSS, count: 1 }, { type: EnemyType.GRUNT, count: 2 }] },
  6:  { enemies: [{ type: EnemyType.GRUNT, count: 4 }, { type: EnemyType.ARCHER, count: 2 }] },
  7:  { enemies: [{ type: EnemyType.GRUNT, count: 3 }, { type: EnemyType.ARCHER, count: 2 }, { type: EnemyType.SPAWNER, count: 1 }] },
  8:  { enemies: [{ type: EnemyType.GRUNT, count: 4 }, { type: EnemyType.ARCHER, count: 2 }, { type: EnemyType.SPAWNER, count: 2 }] },
  9:  { enemies: [{ type: EnemyType.GRUNT, count: 5 }, { type: EnemyType.ARCHER, count: 2 }, { type: EnemyType.SPAWNER, count: 2 }] },
  10: { enemies: [{ type: EnemyType.BOSS, count: 1 }, { type: EnemyType.GRUNT, count: 3 }, { type: EnemyType.ARCHER, count: 2 }] },
};
