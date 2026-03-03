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
  [EnemyType.CHARGER]: { enemyType: EnemyType.CHARGER, hp: 3, attackDamage: 2, attackRange: 8, symbol: '►' },
  [EnemyType.SHIELD]:  { enemyType: EnemyType.SHIELD,  hp: 3, attackDamage: 0, attackRange: 0, symbol: '■' },
  [EnemyType.WARLORD]: { enemyType: EnemyType.WARLORD, hp: 10, attackDamage: 2, attackRange: 1, symbol: 'W' },
  [EnemyType.QUEEN]:   { enemyType: EnemyType.QUEEN,   hp: 15, attackDamage: 2, attackRange: 4, symbol: 'Q' },
};
