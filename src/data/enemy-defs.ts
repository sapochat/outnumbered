import { EnemyType } from '../game/types.js';

export interface EnemyTypeDef {
  readonly enemyType: EnemyType;
  readonly hp: number;
  readonly attackDamage: number;
  readonly attackRange: number;
  readonly symbol: string;
}

export const ENEMY_TYPE_DEFS: Record<EnemyType, EnemyTypeDef> = {
  [EnemyType.GRUNT]:   { enemyType: EnemyType.GRUNT,   hp: 2, attackDamage: 1, attackRange: 1, symbol: '▓' },
  [EnemyType.ARCHER]:  { enemyType: EnemyType.ARCHER,  hp: 2, attackDamage: 1, attackRange: 3, symbol: '░' },
  [EnemyType.SPAWNER]: { enemyType: EnemyType.SPAWNER, hp: 4, attackDamage: 0, attackRange: 0, symbol: 'X' },
  [EnemyType.BOSS]:    { enemyType: EnemyType.BOSS,    hp: 8, attackDamage: 2, attackRange: 1, symbol: 'B' },
};
