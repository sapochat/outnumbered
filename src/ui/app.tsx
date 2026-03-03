import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { GameScreen } from './game-screen.js';
import { type RunState, UnitClass } from '../game/types.js';
import { createNewRun, advancePhase } from '../game/engine.js';

type Screen = 'title' | 'game' | 'reward' | 'game_over';

export const App: React.FC = () => {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('title');
  const [run, setRun] = useState<RunState | null>(null);

  // Input only active when NOT on game screen (game screen has its own handler)
  useInput(
    (input, key) => {
      if (input === 'q') {
        exit();
        return;
      }

      if (screen === 'title' || screen === 'game_over') {
        if (key.return) {
          const newRun = createNewRun(UnitClass.VANGUARD);
          const withIntents = advancePhase(newRun);
          setRun(withIntents);
          setScreen('game');
        }
      }

      if (screen === 'reward') {
        if (key.return) {
          // Placeholder: just go back to title for now (Task 10 adds real logic)
          setScreen('title');
        }
      }
    },
    { isActive: screen !== 'game' },
  );

  if (screen === 'title') {
    return (
      <Box flexDirection="column" alignItems="center" padding={2}>
        <Box
          borderStyle="double"
          borderColor="cyan"
          paddingX={4}
          paddingY={1}
        >
          <Text bold color="cyan">
            O U T N U M B E R E D
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>You are always outnumbered. Never outsmarted.</Text>
        </Box>
        <Box marginTop={2} flexDirection="column" alignItems="center">
          <Text color="yellow">[Enter] Start Run</Text>
          <Text color="gray">[Q] Quit</Text>
        </Box>
      </Box>
    );
  }

  if (screen === 'game' && run) {
    return (
      <GameScreen
        run={run}
        setRun={setRun}
        setScreen={setScreen}
        onQuit={exit}
      />
    );
  }

  if (screen === 'game_over') {
    return (
      <Box flexDirection="column" alignItems="center" padding={2}>
        <Box
          borderStyle="double"
          borderColor="red"
          paddingX={4}
          paddingY={1}
        >
          <Text bold color="red">
            G A M E   O V E R
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text>
            Score:{' '}
            <Text bold color="yellow">
              {run?.score ?? 0}
            </Text>
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text>
            Floor reached:{' '}
            <Text bold>{run?.floor.floorNumber ?? 0}</Text>/10
          </Text>
        </Box>
        <Box marginTop={2} flexDirection="column" alignItems="center">
          <Text color="yellow">[Enter] New Run</Text>
          <Text color="gray">[Q] Quit</Text>
        </Box>
      </Box>
    );
  }

  if (screen === 'reward') {
    return (
      <Box flexDirection="column" alignItems="center" padding={2}>
        <Box
          borderStyle="double"
          borderColor="yellow"
          paddingX={4}
          paddingY={1}
        >
          <Text bold color="yellow">
            F L O O R   C L E A R E D !
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Reward screen coming in Task 10</Text>
        </Box>
        <Box marginTop={2}>
          <Text color="yellow">[Enter] Continue</Text>
        </Box>
      </Box>
    );
  }

  return <Text>Loading...</Text>;
};
