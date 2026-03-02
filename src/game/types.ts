// --- Positions & Grid ---

export interface Position {
  readonly col: number; // 1-8
  readonly row: number; // 1-8
}

export function createPosition(col: number, row: number): Position {
  if (col < 1 || col > 8 || row < 1 || row > 8) {
    throw new Error(`Invalid position: (${col}, ${row}). Must be 1-8.`);
  }
  return { col, row };
}

export function posKey(pos: Position): string {
  return `${pos.col},${pos.row}`;
}

export function posEqual(a: Position, b: Position): boolean {
  return a.col === b.col && a.row === b.row;
}

// --- Enums ---

export enum GamePhase {
  ENEMY_INTENT = 'enemy_intent',
  PLAYER_ACTION = 'player_action',
  RESOLUTION = 'resolution',
}

export enum UnitClass {
  VANGUARD = 'vanguard',
  RANGER = 'ranger',
  ARCANIST = 'arcanist',
}

export enum EnemyType {
  GRUNT = 'grunt',
  ARCHER = 'archer',
  SPAWNER = 'spawner',
  BOSS = 'boss',
}

export enum AbilitySlot {
  ATTACK = 'attack',
  UTILITY = 'utility',
}

// --- Abilities ---

export interface Ability {
  readonly name: string;
  readonly slot: AbilitySlot;
  readonly range: number;        // 0 = melee (adjacent), >0 = ranged
  readonly damage: number;
  readonly description: string;
  readonly aoe: 'single' | 'line' | 'none'; // 'none' for utility abilities
  readonly effect?: 'push' | 'pin' | 'teleport';
  readonly effectValue?: number; // push distance, pin turns, etc.
}

// --- Units ---

export interface UnitState {
  readonly id: string;
  readonly unitClass: UnitClass;
  readonly position: Position;
  readonly hp: number;
  readonly maxHp: number;
  readonly moveRange: number;
  readonly abilities: readonly [Ability, Ability]; // [attack, utility]
  readonly hasMoved: boolean;
  readonly hasActed: boolean;
}

// --- Enemies ---

export type IntentAction =
  | { type: 'move'; target: Position }
  | { type: 'attack'; target: Position; damage: number }
  | { type: 'spawn' }
  | { type: 'idle' };

export interface Intent {
  readonly actions: readonly IntentAction[];
}

export interface EnemyState {
  readonly id: string;
  readonly enemyType: EnemyType;
  readonly position: Position;
  readonly hp: number;
  readonly maxHp: number;
  readonly intent: Intent | null;
  readonly turnsSinceSpawn: number; // for Spawner tracking
  readonly pinned: boolean;
}

// --- Game State ---

export interface FloorState {
  readonly floorNumber: number;  // 1-10
  readonly turn: number;
  readonly enemies: readonly EnemyState[];
}

export interface RunState {
  readonly units: readonly UnitState[];
  readonly floor: FloorState;
  readonly score: number;
  readonly phase: GamePhase;
  readonly selectedUnitIndex: number;
  readonly cursorPosition: Position;
}

export interface GameState {
  readonly run: RunState | null; // null = not in a run
  readonly screen: 'title' | 'game' | 'reward' | 'game_over';
  readonly highScores: readonly number[];
  readonly unlockedClasses: readonly UnitClass[];
}
