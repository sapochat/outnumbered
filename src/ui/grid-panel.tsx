import React from 'react';
import { Box, Text } from 'ink';
import {
  type Position,
  type UnitState,
  type EnemyState,
  type IntentAction,
  UnitClass,
  EnemyType,
  posEqual,
} from '../game/types.js';
import { ENEMY_TYPE_DEFS } from '../data/enemy-defs.js';

interface GridPanelProps {
  readonly units: readonly UnitState[];
  readonly enemies: readonly EnemyState[];
  readonly cursorPosition: Position;
  readonly selectedUnitIndex: number;
}

const CELL_WIDTH = 5;

const UNIT_COLORS: Record<UnitClass, string> = {
  [UnitClass.VANGUARD]: 'cyan',
  [UnitClass.RANGER]: 'green',
  [UnitClass.ARCANIST]: 'magenta',
};

const ENEMY_COLORS: Record<EnemyType, string> = {
  [EnemyType.GRUNT]: 'red',
  [EnemyType.ARCHER]: 'yellow',
  [EnemyType.SPAWNER]: 'redBright',
  [EnemyType.BOSS]: 'white',
};

function getDangerTiles(enemies: readonly EnemyState[]): Position[] {
  const tiles: Position[] = [];
  for (const enemy of enemies) {
    if (!enemy.intent) continue;
    for (const action of enemy.intent.actions) {
      if (action.type === 'attack') {
        tiles.push(action.target);
      }
    }
  }
  return tiles;
}

function padCenter(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width);
  const left = Math.floor((width - str.length) / 2);
  const right = width - str.length - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

export const GridPanel: React.FC<GridPanelProps> = ({
  units,
  enemies,
  cursorPosition,
  selectedUnitIndex,
}) => {
  const dangerTiles = getDangerTiles(enemies);

  const renderCell = (col: number, row: number): React.ReactNode => {
    const pos: Position = { col, row };
    const isCursor = posEqual(pos, cursorPosition);
    const isDanger = dangerTiles.some(d => posEqual(d, pos));

    // Check for player unit
    const unit = units.find(u => posEqual(u.position, pos) && u.hp > 0);
    if (unit) {
      const isSelected = units.indexOf(unit) === selectedUnitIndex;
      const color = UNIT_COLORS[unit.unitClass];
      const symbol = isSelected ? '@' : '@';
      const bgColor = isCursor ? 'yellow' : isDanger ? 'red' : undefined;
      return (
        <Text
          key={`${col}-${row}`}
          color={color}
          backgroundColor={bgColor}
          bold={isSelected}
        >
          {padCenter(symbol, CELL_WIDTH)}
        </Text>
      );
    }

    // Check for enemy
    const enemy = enemies.find(e => posEqual(e.position, pos) && e.hp > 0);
    if (enemy) {
      const def = ENEMY_TYPE_DEFS[enemy.enemyType];
      const color = ENEMY_COLORS[enemy.enemyType];
      const bgColor = isCursor
        ? 'yellow'
        : enemy.enemyType === EnemyType.BOSS
          ? 'red'
          : isDanger
            ? 'red'
            : undefined;
      return (
        <Text
          key={`${col}-${row}`}
          color={color}
          backgroundColor={bgColor}
          bold
        >
          {padCenter(def.symbol, CELL_WIDTH)}
        </Text>
      );
    }

    // Empty tile
    if (isCursor) {
      return (
        <Text key={`${col}-${row}`} backgroundColor="yellow" color="black">
          {padCenter('·', CELL_WIDTH)}
        </Text>
      );
    }

    if (isDanger) {
      return (
        <Text key={`${col}-${row}`} backgroundColor="red" color="white">
          {padCenter('·', CELL_WIDTH)}
        </Text>
      );
    }

    return (
      <Text key={`${col}-${row}`} color="gray">
        {padCenter('·', CELL_WIDTH)}
      </Text>
    );
  };

  return (
    <Box flexDirection="column" alignItems="center">
      {/* Column headers */}
      <Box>
        <Text color="gray">{'  '}</Text>
        {Array.from({ length: 8 }, (_, i) => (
          <Text key={i} color="gray">
            {padCenter(String(i + 1), CELL_WIDTH)}
          </Text>
        ))}
        <Text>{'  '}</Text>
      </Box>

      {/* Top border */}
      <Box>
        <Text color="gray">{'  ┌'}</Text>
        <Text color="gray">{'─'.repeat(CELL_WIDTH * 8)}</Text>
        <Text color="gray">{'┐'}</Text>
      </Box>

      {/* Grid rows */}
      {Array.from({ length: 8 }, (_, rowIdx) => {
        const row = rowIdx + 1;
        return (
          <Box key={row}>
            <Text color="gray">{' │'}</Text>
            {Array.from({ length: 8 }, (_, colIdx) => {
              const col = colIdx + 1;
              return renderCell(col, row);
            })}
            <Text color="gray">{'│'}</Text>
            <Text color="gray">{` ${row}`}</Text>
          </Box>
        );
      })}

      {/* Bottom border */}
      <Box>
        <Text color="gray">{'  └'}</Text>
        <Text color="gray">{'─'.repeat(CELL_WIDTH * 8)}</Text>
        <Text color="gray">{'┘'}</Text>
      </Box>
    </Box>
  );
};
