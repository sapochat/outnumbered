import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { GridPanel } from './grid-panel.js';
import {
  type RunState,
  type IntentAction,
  GamePhase,
  UnitClass,
  EnemyType,
  posEqual,
} from '../game/types.js';
import { advancePhase, isFloorCleared, isGameOver, isRunWon } from '../game/engine.js';
import { moveUnit, markActed } from '../game/units.js';
import { executeAbility } from '../game/combat.js';
import { manhattanDistance, getDirectionBetween } from '../game/grid.js';
import { ENEMY_TYPE_DEFS } from '../data/enemy-defs.js';

type Screen = 'title' | 'game' | 'reward' | 'game_over' | 'victory';

interface GameScreenProps {
  readonly run: RunState;
  readonly setRun: (run: RunState) => void;
  readonly setScreen: (screen: Screen) => void;
  readonly onQuit: () => void;
}

const UNIT_COLORS: Record<UnitClass, string> = {
  [UnitClass.VANGUARD]: 'cyan',
  [UnitClass.RANGER]: 'green',
  [UnitClass.ARCANIST]: 'magenta',
};

const UNIT_NAMES: Record<UnitClass, string> = {
  [UnitClass.VANGUARD]: 'Vanguard',
  [UnitClass.RANGER]: 'Ranger',
  [UnitClass.ARCANIST]: 'Arcanist',
};

const ENEMY_NAMES: Record<EnemyType, string> = {
  [EnemyType.GRUNT]: 'Grunt',
  [EnemyType.ARCHER]: 'Archer',
  [EnemyType.SPAWNER]: 'Spawner',
  [EnemyType.CHARGER]: 'Charger',
  [EnemyType.SHIELD]: 'Shield',
  [EnemyType.WARLORD]: 'WARLORD',
  [EnemyType.QUEEN]: 'QUEEN',
};

const ENEMY_COLORS: Record<EnemyType, string> = {
  [EnemyType.GRUNT]: 'red',
  [EnemyType.ARCHER]: 'yellow',
  [EnemyType.SPAWNER]: 'redBright',
  [EnemyType.CHARGER]: 'yellowBright',
  [EnemyType.SHIELD]: 'blueBright',
  [EnemyType.WARLORD]: 'white',
  [EnemyType.QUEEN]: 'magentaBright',
};

function hpColor(hp: number, maxHp: number): string {
  const ratio = hp / maxHp;
  if (ratio > 0.6) return 'green';
  if (ratio > 0.3) return 'yellow';
  return 'red';
}

function renderHpBar(hp: number, maxHp: number): React.ReactNode {
  const color = hpColor(hp, maxHp);
  const filled = '♥'.repeat(hp);
  const empty = '░'.repeat(maxHp - hp);
  return (
    <Text>
      <Text color={color}>{filled}</Text>
      <Text color="gray">{empty}</Text>
      <Text dimColor>{` ${hp}/${maxHp}`}</Text>
    </Text>
  );
}

function intentDescription(action: IntentAction): string {
  switch (action.type) {
    case 'move':
      return `Move->(${action.target.col},${action.target.row})`;
    case 'attack':
      return `ATK (${action.target.col},${action.target.row}) -${action.damage}`;
    case 'spawn':
      return 'SPAWN new grunt';
    case 'idle':
      return 'Idle';
    case 'buff':
      return 'WAR CRY! +1 dmg';
  }
}

function statusMessage(run: RunState): string {
  const unit = run.units[run.selectedUnitIndex];
  if (!unit) return '';

  const parts: string[] = [];
  if (run.phase === GamePhase.PLAYER_ACTION) {
    parts.push('[WASD/Arrows] Cursor');
    if (!unit.hasMoved) parts.push('[Enter] Move');
    if (!unit.hasActed) parts.push('[1] Attack  [2] Utility');
    parts.push('[Space] End Turn');
    parts.push('[Tab] Cycle Unit');
    parts.push('[Q] Quit');
  } else {
    parts.push(`Phase: ${run.phase}`);
  }
  return parts.join('  ');
}

export const GameScreen: React.FC<GameScreenProps> = ({ run, setRun, setScreen, onQuit }) => {
  const [message, setMessage] = useState<string>('');
  const [confirmQuit, setConfirmQuit] = useState(false);

  const selectedUnit = run.units[run.selectedUnitIndex];

  useInput((input, key) => {
    // Handle quit confirmation
    if (confirmQuit) {
      if (input === 'y' || input === 'Y') {
        onQuit();
      } else {
        setConfirmQuit(false);
      }
      return;
    }

    // Quit from game screen
    if (input === 'q') {
      setConfirmQuit(true);
      return;
    }

    if (run.phase !== GamePhase.PLAYER_ACTION) return;

    // Cursor movement
    if (input === 'w' || key.upArrow) {
      if (run.cursorPosition.row > 1) {
        setRun({
          ...run,
          cursorPosition: { col: run.cursorPosition.col, row: run.cursorPosition.row - 1 },
        });
        setMessage('');
      }
      return;
    }
    if (input === 's' || key.downArrow) {
      if (run.cursorPosition.row < 8) {
        setRun({
          ...run,
          cursorPosition: { col: run.cursorPosition.col, row: run.cursorPosition.row + 1 },
        });
        setMessage('');
      }
      return;
    }
    if (input === 'a' || key.leftArrow) {
      if (run.cursorPosition.col > 1) {
        setRun({
          ...run,
          cursorPosition: { col: run.cursorPosition.col - 1, row: run.cursorPosition.row },
        });
        setMessage('');
      }
      return;
    }
    if (input === 'd' || key.rightArrow) {
      if (run.cursorPosition.col < 8) {
        setRun({
          ...run,
          cursorPosition: { col: run.cursorPosition.col + 1, row: run.cursorPosition.row },
        });
        setMessage('');
      }
      return;
    }

    // Cycle units with Tab
    if (key.tab) {
      const aliveUnits = run.units.filter(u => u.hp > 0);
      if (aliveUnits.length <= 1) return;
      let nextIndex = (run.selectedUnitIndex + 1) % run.units.length;
      while (run.units[nextIndex].hp <= 0) {
        nextIndex = (nextIndex + 1) % run.units.length;
      }
      setRun({
        ...run,
        selectedUnitIndex: nextIndex,
        cursorPosition: run.units[nextIndex].position,
      });
      setMessage('');
      return;
    }

    // Move unit with Enter
    if (key.return) {
      if (!selectedUnit || selectedUnit.hasMoved) {
        setMessage('Unit already moved this turn.');
        return;
      }
      const target = run.cursorPosition;
      const dist = manhattanDistance(selectedUnit.position, target);
      if (dist === 0) {
        setMessage('Already at that position.');
        return;
      }
      if (dist > selectedUnit.moveRange) {
        setMessage(`Out of move range (max ${selectedUnit.moveRange}).`);
        return;
      }
      // Check tile is unoccupied
      const occupied = [
        ...run.units.filter(u => u.hp > 0).map(u => u.position),
        ...run.floor.enemies.filter(e => e.hp > 0).map(e => e.position),
      ];
      if (occupied.some(p => posEqual(p, target) && !posEqual(p, selectedUnit.position))) {
        setMessage('Tile is occupied!');
        return;
      }
      const newUnits = run.units.map((u, i) =>
        i === run.selectedUnitIndex ? moveUnit(u, target) : u,
      );
      setRun({ ...run, units: newUnits });
      setMessage(`${UNIT_NAMES[selectedUnit.unitClass]} moved to (${target.col},${target.row}).`);
      return;
    }

    // Use attack ability (1)
    if (input === '1') {
      if (!selectedUnit || selectedUnit.hasActed) {
        setMessage('Unit already acted this turn.');
        return;
      }
      const ability = selectedUnit.abilities[0];
      const target = run.cursorPosition;
      const dist = manhattanDistance(selectedUnit.position, target);
      if (ability.range > 0 && dist > ability.range) {
        setMessage(`${ability.name} out of range (max ${ability.range}).`);
        return;
      }
      if (ability.range === 0 && dist > 1) {
        setMessage(`${ability.name} requires adjacent target.`);
        return;
      }
      const result = executeAbility(selectedUnit, 0, target, run.units, run.floor.enemies);
      const newUnits = result.units.map((u, i) =>
        i === run.selectedUnitIndex ? markActed(u) : u,
      );
      setRun({
        ...run,
        units: newUnits,
        floor: { ...run.floor, enemies: result.enemies },
      });
      setMessage(`${ability.name} used at (${target.col},${target.row})!`);
      return;
    }

    // Use utility ability (2)
    if (input === '2') {
      if (!selectedUnit || selectedUnit.hasActed) {
        setMessage('Unit already acted this turn.');
        return;
      }
      const ability = selectedUnit.abilities[1];
      const target = run.cursorPosition;

      // Teleport (Warp) — target must be empty
      if (ability.effect === 'teleport') {
        const occupied = [
          ...run.units.filter(u => u.hp > 0).map(u => u.position),
          ...run.floor.enemies.filter(e => e.hp > 0).map(e => e.position),
        ];
        if (occupied.some(p => posEqual(p, target))) {
          setMessage('Cannot warp to occupied tile.');
          return;
        }
        const newUnits = run.units.map((u, i) =>
          i === run.selectedUnitIndex
            ? markActed({ ...u, position: target })
            : u,
        );
        setRun({ ...run, units: newUnits });
        setMessage(`Warped to (${target.col},${target.row})!`);
        return;
      }

      if (ability.effect === 'heal') {
        const dist = manhattanDistance(selectedUnit.position, target);
        if (dist > 1) {
          setMessage('Heal requires adjacent target or self.');
          return;
        }
        const targetUnitIdx = run.units.findIndex(u => u.hp > 0 && posEqual(u.position, target));
        if (targetUnitIdx === -1) {
          setMessage('No ally at that position.');
          return;
        }
        const healAmount = ability.effectValue ?? 2;
        const newUnits = run.units.map((u, i) => {
          if (i === targetUnitIdx) {
            return { ...u, hp: Math.min(u.maxHp, u.hp + healAmount) };
          }
          if (i === run.selectedUnitIndex) {
            return markActed(u);
          }
          return u;
        });
        setRun({ ...run, units: newUnits });
        setMessage(`Healed for ${healAmount} HP!`);
        return;
      }

      if (ability.effect === 'dash') {
        const dir = getDirectionBetween(selectedUnit.position, target);
        if (!dir) {
          setMessage('Dash requires a straight line (cardinal direction).');
          return;
        }
        const maxDist = ability.effectValue ?? 4;
        const dist = manhattanDistance(selectedUnit.position, target);
        if (dist > maxDist) {
          setMessage(`Dash max range is ${maxDist}.`);
          return;
        }
        const occupied = [
          ...run.units.filter(u => u.hp > 0 && u.id !== selectedUnit.id).map(u => u.position),
          ...run.floor.enemies.filter(e => e.hp > 0).map(e => e.position),
        ];
        if (occupied.some(p => posEqual(p, target))) {
          setMessage('Cannot dash to occupied tile.');
          return;
        }
        const newUnits = run.units.map((u, i) =>
          i === run.selectedUnitIndex
            ? markActed({ ...u, position: target })
            : u,
        );
        setRun({ ...run, units: newUnits });
        setMessage(`Dashed to (${target.col},${target.row})!`);
        return;
      }

      const dist = manhattanDistance(selectedUnit.position, target);
      if (ability.range > 0 && dist > ability.range) {
        setMessage(`${ability.name} out of range (max ${ability.range}).`);
        return;
      }
      if (ability.range === 0 && dist > 1) {
        setMessage(`${ability.name} requires adjacent target.`);
        return;
      }
      const result = executeAbility(selectedUnit, 1, target, run.units, run.floor.enemies);
      const newUnits = result.units.map((u, i) =>
        i === run.selectedUnitIndex ? markActed(u) : u,
      );
      setRun({
        ...run,
        units: newUnits,
        floor: { ...run.floor, enemies: result.enemies },
      });
      setMessage(`${ability.name} used at (${target.col},${target.row})!`);
      return;
    }

    // End turn with Space
    if (input === ' ') {
      // Advance to RESOLUTION
      let next = advancePhase(run);
      // Then immediately resolve and go back to ENEMY_INTENT -> PLAYER_ACTION
      next = advancePhase(next); // RESOLUTION -> ENEMY_INTENT
      // Check game over
      if (isGameOver(next)) {
        setRun(next);
        setScreen('game_over');
        return;
      }
      // Check floor cleared
      if (isFloorCleared(next)) {
        setRun(next);
        if (isRunWon(next)) {
          setScreen('victory');
        } else {
          setScreen('reward');
        }
        return;
      }
      // Advance to PLAYER_ACTION (generate intents)
      next = advancePhase(next); // ENEMY_INTENT -> PLAYER_ACTION
      setRun(next);
      setMessage('Enemy turn resolved. New turn begins.');
      return;
    }
  });

  if (confirmQuit) {
    return (
      <Box flexDirection="column" alignItems="center" padding={4}>
        <Text bold color="yellow">Quit game?</Text>
        <Box marginTop={1}>
          <Text>[Y] Yes    [N] No</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Header bar */}
      <Box justifyContent="space-between" paddingX={1}>
        <Text bold color="cyan">
          OUTNUMBERED
        </Text>
        <Text dimColor>
          Floor {run.floor.floorNumber}/10 {'  '} Turn {run.floor.turn} {'  '} Score: {run.score}
        </Text>
      </Box>

      <Box paddingX={1}>
        <Text color="gray">{'─'.repeat(110)}</Text>
      </Box>

      {/* Three-column layout */}
      <Box flexDirection="row" paddingX={1}>
        {/* Left panel: Squad info */}
        <Box
          flexDirection="column"
          width={24}
          borderStyle="single"
          borderColor="gray"
          paddingX={1}
        >
          <Text bold color="white" underline>
            SQUAD
          </Text>
          <Text>{' '}</Text>
          {run.units.map((unit, idx) => {
            const isSelected = idx === run.selectedUnitIndex;
            const color = UNIT_COLORS[unit.unitClass];
            const alive = unit.hp > 0;
            return (
              <Box key={unit.id} flexDirection="column" marginBottom={1}>
                <Text>
                  {isSelected ? <Text color="yellow">{'>'}</Text> : ' '}
                  <Text color={alive ? color : 'gray'} bold={isSelected}>
                    {' '}
                    {UNIT_NAMES[unit.unitClass]}
                  </Text>
                  {!alive && <Text color="red"> [DEAD]</Text>}
                </Text>
                {alive && (
                  <>
                    <Text>  {renderHpBar(unit.hp, unit.maxHp)}</Text>
                    <Text>
                      {'  '}
                      <Text color="cyan">[1]</Text>
                      <Text dimColor> {unit.abilities[0].name}</Text>
                      <Text dimColor>{unit.hasActed ? ' ✗' : ''}</Text>
                    </Text>
                    <Text>
                      {'  '}
                      <Text color="blue">[2]</Text>
                      <Text dimColor> {unit.abilities[1].name}</Text>
                    </Text>
                    <Text dimColor>
                      {'  '}Move: {unit.moveRange}
                      {unit.hasMoved ? ' (moved)' : ''}
                    </Text>
                  </>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Center panel: Grid */}
        <Box flexDirection="column" flexGrow={1} alignItems="center" paddingX={1}>
          <GridPanel
            units={run.units}
            enemies={run.floor.enemies}
            cursorPosition={run.cursorPosition}
            selectedUnitIndex={run.selectedUnitIndex}
          />
          {/* Cursor info */}
          <Box marginTop={1}>
            <Text dimColor>
              Cursor: ({run.cursorPosition.col},{run.cursorPosition.row})
            </Text>
          </Box>
        </Box>

        {/* Right panel: Enemy intents */}
        <Box
          flexDirection="column"
          width={24}
          borderStyle="single"
          borderColor="gray"
          paddingX={1}
        >
          <Text bold color="white" underline>
            THREATS
          </Text>
          <Text>{' '}</Text>
          {run.floor.enemies
            .filter(e => e.hp > 0)
            .map(enemy => {
              const def = ENEMY_TYPE_DEFS[enemy.enemyType];
              const color = ENEMY_COLORS[enemy.enemyType];
              return (
                <Box key={enemy.id} flexDirection="column" marginBottom={1}>
                  <Text>
                    <Text color={color} bold>
                      {def.symbol}
                    </Text>
                    <Text color={color}> {ENEMY_NAMES[enemy.enemyType]}</Text>
                    <Text dimColor>
                      {' '}({enemy.position.col},{enemy.position.row})
                    </Text>
                  </Text>
                  <Text>
                    {'  '}
                    {renderHpBar(enemy.hp, enemy.maxHp)}
                  </Text>
                  {enemy.intent && (
                    <Box flexDirection="column">
                      {enemy.intent.actions.map((action, i) => (
                        <Text key={i} dimColor>
                          {'  '}{intentDescription(action)}
                        </Text>
                      ))}
                    </Box>
                  )}
                  {enemy.pinned && (
                    <Text color="blue">{'  '}PINNED</Text>
                  )}
                </Box>
              );
            })}
          {run.floor.enemies.filter(e => e.hp > 0).length === 0 && (
            <Text dimColor>No enemies</Text>
          )}
        </Box>
      </Box>

      {/* Bottom bar: controls & messages */}
      <Box paddingX={1}>
        <Text color="gray">{'─'.repeat(110)}</Text>
      </Box>

      <Box paddingX={2} justifyContent="space-between">
        <Text dimColor>{statusMessage(run)}</Text>
      </Box>

      {message !== '' && (
        <Box paddingX={2}>
          <Text color="yellowBright">{message}</Text>
        </Box>
      )}
    </Box>
  );
};
