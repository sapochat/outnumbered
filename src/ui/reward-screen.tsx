import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { type Ability, AbilitySlot, type RunState, UnitClass, createPosition } from '../game/types.js';
import { createUnit, healUnit } from '../game/units.js';
import { advanceToNextFloor } from '../game/engine.js';
import { ATTACK_ABILITIES, UTILITY_ABILITIES } from '../data/ability-pool.js';

type RewardType = 'heal' | 'stat_hp' | 'stat_move' | 'recruit' | 'ability_attack' | 'ability_utility';

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
  pool.push({ type: 'ability_attack', label: 'NEW ATTACK', description: 'Learn a new attack ability' });
  pool.push({ type: 'ability_utility', label: 'NEW UTILITY', description: 'Learn a new utility ability' });
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
  const [subFlow, setSubFlow] = useState<'main' | 'pick_unit' | 'pick_ability'>('main');
  const [pendingReward, setPendingReward] = useState<RewardType | null>(null);
  const [unitPick, setUnitPick] = useState(0);
  const [abilityOptions, setAbilityOptions] = useState<Ability[]>([]);
  const [abilityPick, setAbilityPick] = useState(0);

  useInput((input, key) => {
    if (subFlow === 'pick_unit') {
      if (input === 'w' || key.upArrow) setUnitPick(s => Math.max(0, s - 1));
      if (input === 's' || key.downArrow) setUnitPick(s => Math.min(run.units.length - 1, s + 1));
      if (key.return) {
        const pool = pendingReward === 'ability_attack' ? ATTACK_ABILITIES : UTILITY_ABILITIES;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setAbilityOptions(shuffled.slice(0, 2));
        setAbilityPick(0);
        setSubFlow('pick_ability');
      }
      if (input === 'q' || key.escape) {
        setSubFlow('main');
        setPendingReward(null);
      }
      return;
    }

    if (subFlow === 'pick_ability') {
      if (input === 'w' || key.upArrow) setAbilityPick(s => Math.max(0, s - 1));
      if (input === 's' || key.downArrow) setAbilityPick(s => Math.min(abilityOptions.length - 1, s + 1));
      if (key.return) {
        const newAbility = abilityOptions[abilityPick];
        const slotIndex = pendingReward === 'ability_attack' ? 0 : 1;
        const updatedRun: RunState = {
          ...run,
          units: run.units.map((u, i) => {
            if (i !== unitPick) return u;
            const newAbilities = [...u.abilities] as [Ability, Ability];
            newAbilities[slotIndex] = newAbility;
            return { ...u, abilities: newAbilities as readonly [Ability, Ability] };
          }),
        };
        onSelect(advanceToNextFloor(updatedRun));
      }
      if (input === 'q' || key.escape) {
        setSubFlow('pick_unit');
        setAbilityOptions([]);
        setAbilityPick(0);
      }
      return;
    }

    if (input === 'w' || key.upArrow) setSelected(s => Math.max(0, s - 1));
    if (input === 's' || key.downArrow) setSelected(s => Math.min(rewards.length - 1, s + 1));

    if (key.return) {
      const reward = rewards[selected];

      if (reward.type === 'ability_attack' || reward.type === 'ability_utility') {
        setPendingReward(reward.type);
        setUnitPick(0);
        setSubFlow('pick_unit');
        return;
      }

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

  if (subFlow === 'pick_unit') {
    return (
      <Box flexDirection="column" alignItems="center" padding={2}>
        <Text bold color="yellow">Pick a unit to learn the ability:</Text>
        <Box flexDirection="column" marginTop={1} width={40}>
          {run.units.map((unit, i) => (
            <Box
              key={unit.id}
              borderStyle={i === unitPick ? 'double' : 'single'}
              borderColor={i === unitPick ? 'yellow' : 'gray'}
              paddingX={2}
              marginTop={i > 0 ? 1 : 0}
            >
              <Text bold={i === unitPick} color={i === unitPick ? 'yellow' : 'white'}>
                {i === unitPick ? '> ' : '  '}{unit.unitClass.toUpperCase()}
                {' '}- {unit.abilities[pendingReward === 'ability_attack' ? 0 : 1].name}
              </Text>
            </Box>
          ))}
        </Box>
        <Box marginTop={1}>
          <Text dimColor>[W/S] Navigate  [Enter] Select  [Q] Back</Text>
        </Box>
      </Box>
    );
  }

  if (subFlow === 'pick_ability') {
    const replacing = run.units[unitPick].abilities[pendingReward === 'ability_attack' ? 0 : 1];
    return (
      <Box flexDirection="column" alignItems="center" padding={2}>
        <Text bold color="yellow">Replace {replacing.name} with:</Text>
        <Box flexDirection="column" marginTop={1} width={40}>
          {abilityOptions.map((ability, i) => (
            <Box
              key={ability.name}
              borderStyle={i === abilityPick ? 'double' : 'single'}
              borderColor={i === abilityPick ? 'yellow' : 'gray'}
              paddingX={2}
              marginTop={i > 0 ? 1 : 0}
              flexDirection="column"
            >
              <Text bold={i === abilityPick} color={i === abilityPick ? 'yellow' : 'white'}>
                {i === abilityPick ? '> ' : '  '}{ability.name}
              </Text>
              <Text dimColor>  {ability.description}</Text>
              {ability.damage > 0 && <Text dimColor>  DMG: {ability.damage}  Range: {ability.range}</Text>}
              {ability.effect && <Text dimColor>  Effect: {ability.effect}</Text>}
            </Box>
          ))}
        </Box>
        <Box marginTop={1}>
          <Text dimColor>[W/S] Navigate  [Enter] Confirm  [Q] Back</Text>
        </Box>
      </Box>
    );
  }

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
