// SPDX-License-Identifier: Apache-2.0
// Copyright (C) 2024, Tiny Tapeout LTD
// Author: Uri Shaked

import { List, ListItem } from '@suid/material';
import { For, createEffect } from 'solid-js';
import { ILogEntry } from '~/ttcontrol/TTBoardDevice';

function factoryTestResult(text: string): 'pass' | 'fail' | null {
  const trimmed = text.trim();
  if (trimmed === 'factory_test=OK') {
    return 'pass';
  }
  if (trimmed.startsWith('error=factory_test_clocking')) {
    return 'fail';
  }
  return null;
}

export function DebugLogs(props: { logs: ILogEntry[] }) {
  let listRef: HTMLUListElement | null = null;

  createEffect(() => {
    if (listRef && props.logs.length > 0) {
      listRef.scrollTop = listRef.scrollHeight;
    }
  });

  return (
    <List
      dense
      ref={(el) => (listRef = el)}
      sx={{
        background: 'black',
        fontFamily: 'monospace',
        marginTop: 2,
        maxHeight: 400,
        overflow: 'auto',
      }}
    >
      <ListItem sx={{ color: '#ccc' }}>Debug log</ListItem>
      <For
        each={props.logs}
        children={(logEntry) => {
          const result = factoryTestResult(logEntry.text);
          const color = result ? '#fff' : logEntry.sent ? '#ccffcc' : '#ffccff';
          const background =
            result === 'pass' ? '#1b5e20' : result === 'fail' ? '#b71c1c' : 'transparent';
          const fontWeight = result ? 'bold' : 'normal';
          return (
            <ListItem
              sx={{
                color,
                background,
                fontWeight,
                paddingTop: 0,
                paddingBottom: 0,
              }}
            >
              {logEntry.sent ? '> ' : ''}
              {logEntry.text}
            </ListItem>
          );
        }}
      />
    </List>
  );
}
