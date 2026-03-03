import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { type RunState, UnitClass, createPosition } from '../game/types.js';
import { createUnit, healUnit } from '../game/units.js';
import { advanceToNextFloor } from '../game/engine.js';

type RewardType = 'heal' | 'stat_hp' | 'stat_move' | 'recruit';

interface Reward {
  type: RewardType;
  label: string;
  description: string;
}

function generateRewards(run: RunState): Reward[] {
  const pool: Reward[] = [
    { type: 'heal', label: 'HEAL', description: 'Restore all units to full HP' },
    { type: 'stat_hp', label: '+1 HP', description: 'Increase max HP by 1 for selected unit' },
    { type: 'stat_move', label: '+1 MOVE', description: 'Increase move range by 1 for selected unit' },
  ];
  if (run.units.length < 3) {
    pool.push({ type: 'recruit', label: 'RECRUIT', description: 'Add a new unit to your squad' });
  }
  // Shuffle and take 3
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

interface Props {
  run: RunState;
  onSelect: (updatedRun: RunState) => void;
}

export const RewardScreen: React.FC<Props> = ({ run, onSelect }) => {
  const rewards = useMemo(() => generateRewards(run), []);
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (input === 'w' || key.upArrow) setSelected(s => Math.max(0, s - 1));
    if (input === 's' || key.downArrow) setSelected(s => Math.min(rewards.length - 1, s + 1));

    if (key.return) {
      const reward = rewards[selected];
      let updatedRun: RunState = run;

      switch (reward.type) {
        case 'heal':
          updatedRun = { ...run, units: run.units.map(u => healUnit(u)) };
          break;
        case 'stat_hp':
          updatedRun = {
            ...run,
            units: run.units.map((u, i) =>
              i === run.selectedUnitIndex ? { ...u, maxHp: u.maxHp + 1, hp: u.hp + 1 } : u,
            ),
          };
          break;
        case 'stat_move':
          updatedRun = {
            ...run,
            units: run.units.map((u, i) =>
              i === run.selectedUnitIndex ? { ...u, moveRange: u.moveRange + 1 } : u,
            ),
          };
          break;
        case 'recruit': {
          const newUnit = createUnit(UnitClass.RANGER, createPosition(2, 5));
          updatedRun = { ...run, units: [...run.units, newUnit] };
          break;
        }
      }

      onSelect(advanceToNextFloor(updatedRun));
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" padding={2}>
      <Box borderStyle="double" borderColor="yellow" paddingX={4} paddingY={1}>
        <Box flexDirection="column">
          <Text bold color="yellow">
            {'     '}FLOOR {run.floor.floorNumber} CLEARED!
          </Text>
          <Text>
            {'     '}Score: <Text bold color="yellow">{run.score}</Text>
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginTop={2} width={40}>
        {rewards.map((reward, i) => (
          <Box
            key={reward.type}
            borderStyle={i === selected ? 'double' : 'single'}
            borderColor={i === selected ? 'yellow' : 'gray'}
            paddingX={2}
            marginTop={i > 0 ? 1 : 0}
            flexDirection="column"
          >
            <Text bold={i === selected} color={i === selected ? 'yellow' : 'white'}>
              {i === selected ? '> ' : '  '}{reward.label}
            </Text>
            <Text dimColor>  {reward.description}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={2}>
        <Text dimColor>[W/S] Navigate    [Enter] Select</Text>
      </Box>
    </Box>
  );
};
