#!/usr/bin/env node
import React from 'react';
import { render, Text, Box } from 'ink';

const App = () => (
  <Box borderStyle="round" padding={1}>
    <Text bold color="cyan">OUTNUMBERED</Text>
  </Box>
);

render(<App />);
