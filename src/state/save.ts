import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { UnitClass } from '../game/types.js';

export interface MetaState {
  highScores: number[];
  unlockedClasses: UnitClass[];
}

const DEFAULT_META: MetaState = {
  highScores: [],
  unlockedClasses: [UnitClass.VANGUARD],
};

function getSaveDir(customDir?: string): string {
  return customDir ?? join(homedir(), '.outnumbered');
}

export function loadMeta(customDir?: string): MetaState {
  const dir = getSaveDir(customDir);
  const path = join(dir, 'meta.json');
  if (!existsSync(path)) return { ...DEFAULT_META };
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as MetaState;
}

export function saveMeta(meta: MetaState, customDir?: string): void {
  const dir = getSaveDir(customDir);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'meta.json'), JSON.stringify(meta, null, 2));
}

export function addHighScore(meta: MetaState, score: number): MetaState {
  const scores = [...meta.highScores, score].sort((a, b) => b - a).slice(0, 10);
  return { ...meta, highScores: scores };
}

export function unlockClass(meta: MetaState, unitClass: UnitClass): MetaState {
  if (meta.unlockedClasses.includes(unitClass)) return meta;
  return { ...meta, unlockedClasses: [...meta.unlockedClasses, unitClass] };
}
