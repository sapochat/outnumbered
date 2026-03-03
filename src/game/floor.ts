import { type EnemyState, createPosition } from './types.js';
import { createEnemy } from './enemies.js';
import { FLOOR_TABLES } from '../data/floor-tables.js';

export function generateFloorEnemies(floorNumber: number): EnemyState[] {
  const composition = FLOOR_TABLES[floorNumber];
  if (!composition) {
    throw new Error(`No floor table for floor ${floorNumber}`);
  }

  const enemies: EnemyState[] = [];
  const usedPositions = new Set<string>();

  for (const entry of composition.enemies) {
    for (let i = 0; i < entry.count; i++) {
      let col: number;
      let row: number;
      let key: string;
      do {
        col = 5 + Math.floor(Math.random() * 4); // 5-8
        row = 1 + Math.floor(Math.random() * 8); // 1-8
        key = `${col},${row}`;
      } while (usedPositions.has(key));

      usedPositions.add(key);
      enemies.push(createEnemy(entry.type, createPosition(col, row)));
    }
  }

  return enemies;
}
