import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadMeta, saveMeta, addHighScore, unlockClass } from '../../src/state/save.js';
import { UnitClass } from '../../src/game/types.js';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

const TEST_DIR = join(import.meta.dirname, '.test-outnumbered');

describe('Save System', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  });

  it('loads default meta when no save exists', () => {
    const meta = loadMeta(TEST_DIR);
    expect(meta.highScores).toEqual([]);
    expect(meta.unlockedClasses).toEqual([UnitClass.VANGUARD]);
  });

  it('saves and loads meta', () => {
    const meta = { highScores: [100, 50], unlockedClasses: [UnitClass.VANGUARD, UnitClass.RANGER] };
    saveMeta(meta, TEST_DIR);
    const loaded = loadMeta(TEST_DIR);
    expect(loaded).toEqual(meta);
  });

  it('adds high score in sorted order (top 10)', () => {
    const meta = { highScores: [100, 80, 60], unlockedClasses: [UnitClass.VANGUARD] };
    const updated = addHighScore(meta, 90);
    expect(updated.highScores).toEqual([100, 90, 80, 60]);
  });

  it('caps at 10 high scores', () => {
    const meta = { highScores: Array.from({ length: 10 }, (_, i) => 100 - i), unlockedClasses: [UnitClass.VANGUARD] };
    const updated = addHighScore(meta, 5);
    expect(updated.highScores).toHaveLength(10);
  });

  it('unlocks a new class', () => {
    const meta = { highScores: [], unlockedClasses: [UnitClass.VANGUARD] };
    const updated = unlockClass(meta, UnitClass.RANGER);
    expect(updated.unlockedClasses).toContain(UnitClass.RANGER);
  });

  it('does not duplicate unlocked class', () => {
    const meta = { highScores: [], unlockedClasses: [UnitClass.VANGUARD] };
    const updated = unlockClass(meta, UnitClass.VANGUARD);
    expect(updated.unlockedClasses).toHaveLength(1);
  });
});
