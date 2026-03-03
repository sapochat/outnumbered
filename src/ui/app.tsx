import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { GameScreen } from './game-screen.js';
import { RewardScreen } from './reward-screen.js';
import { type RunState, UnitClass } from '../game/types.js';
import { createNewRun, advancePhase } from '../game/engine.js';
import { loadMeta, saveMeta, addHighScore, unlockClass, type MetaState } from '../state/save.js';

type Screen = 'title' | 'game' | 'reward' | 'game_over' | 'victory';

export const App: React.FC = () => {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('title');
  const [run, setRun] = useState<RunState | null>(null);
  const [meta, setMeta] = useState<MetaState>(() => loadMeta());

  // Wrapper around setScreen that triggers persistence side effects
  const handleScreenChange = useCallback(
    (newScreen: Screen) => {
      if (newScreen === 'game_over' && run) {
        // Save the high score
        let updated = addHighScore(meta, run.score);
        saveMeta(updated);
        setMeta(updated);
      }

      if (newScreen === 'reward' && run && run.floor.floorNumber >= 5) {
        // Unlock Ranger when clearing floor 5+
        let updated = unlockClass(meta, UnitClass.RANGER);
        saveMeta(updated);
        setMeta(updated);
      }

      if (newScreen === 'victory' && run) {
        // Unlock Arcanist on victory + save high score
        let updated = addHighScore(meta, run.score);
        updated = unlockClass(updated, UnitClass.ARCANIST);
        saveMeta(updated);
        setMeta(updated);
      }

      setScreen(newScreen);
    },
    [run, meta],
  );

  // Input only active when NOT on game screen (game screen has its own handler)
  useInput(
    (input, key) => {
      if (input === 'q') {
        exit();
        return;
      }

      if (screen === 'title' || screen === 'game_over' || screen === 'victory') {
        if (key.return) {
          const newRun = createNewRun(UnitClass.VANGUARD);
          const withIntents = advancePhase(newRun);
          setRun(withIntents);
          setScreen('game');
        }
      }
    },
    { isActive: screen !== 'game' && screen !== 'reward' },
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
        {meta.highScores.length > 0 && (
          <Box marginTop={1} flexDirection="column" alignItems="center">
            <Text bold color="white">High Scores</Text>
            {meta.highScores.slice(0, 3).map((score, i) => (
              <Text key={i} color="yellow">
                {i + 1}. {score}
              </Text>
            ))}
          </Box>
        )}
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
        setScreen={handleScreenChange}
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

  if (screen === 'reward' && run) {
    return (
      <RewardScreen
        run={run}
        onSelect={(updatedRun) => {
          const withIntents = advancePhase(updatedRun);
          setRun(withIntents);
          setScreen('game');
        }}
      />
    );
  }

  if (screen === 'victory' && run) {
    return (
      <Box flexDirection="column" alignItems="center" padding={2}>
        <Box borderStyle="double" borderColor="green" paddingX={4} paddingY={1}>
          <Text bold color="green">
            V I C T O R Y !
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text>You cleared all 10 floors!</Text>
        </Box>
        <Box marginTop={1}>
          <Text>
            Final Score:{' '}
            <Text bold color="yellow">{run.score}</Text>
          </Text>
        </Box>
        <Box marginTop={2} flexDirection="column" alignItems="center">
          <Text color="yellow">[Enter] New Run</Text>
          <Text color="gray">[Q] Quit</Text>
        </Box>
      </Box>
    );
  }

  return <Text>Loading...</Text>;
};
