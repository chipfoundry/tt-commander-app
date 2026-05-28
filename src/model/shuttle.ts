// SPDX-License-Identifier: Apache-2.0
// Copyright (C) 2024, Tiny Tapeout LTD
// Author: Uri Shaked

import { createStore } from 'solid-js/store';

export interface Project {
  macro: string;
  address: number;
  title: string;
  author: string;
  repo: string;
  commit: string;
  clock_hz: number;
  danger_level?: 'high' | 'medium' | 'safe' | 'unknown';
  danger_reason?: string;
}

const defaultShuttleIndexBaseUrl = 'https://index.tinytapeout.com';
const configuredShuttleIndexBaseUrl = (
  import.meta.env.VITE_SHUTTLE_INDEX_BASE_URL as string | undefined
)?.replace(/\/$/, '');
const configuredShuttleIndexUrl = import.meta.env.VITE_SHUTTLE_INDEX_URL as string | undefined;

export function shuttleIndexUrl(id: string) {
  if (configuredShuttleIndexUrl) {
    return configuredShuttleIndexUrl;
  }
  const base = configuredShuttleIndexBaseUrl || defaultShuttleIndexBaseUrl;
  return `${base}/${id}.json`;
}

function normalizeProject(project: Partial<Project> & Pick<Project, 'macro' | 'address'>): Project {
  return {
    macro: project.macro,
    address: project.address,
    title: project.title || project.macro,
    author: project.author || 'Unknown',
    repo: project.repo || '',
    commit: project.commit || '',
    clock_hz: project.clock_hz ?? 0,
    danger_level: project.danger_level,
    danger_reason: project.danger_reason,
  };
}

export const [shuttle, updateShuttle] = createStore({
  id: 'unknown',
  loading: true,
  projects: [] as Project[],
});

export async function loadShuttle(id: string) {
  updateShuttle({
    id,
    projects: [],
    loading: true,
  });
  try {
    const request = await fetch(shuttleIndexUrl(id));
    const shuttleIndex: { projects: (Partial<Project> & Pick<Project, 'macro' | 'address'>)[] } =
      await request.json();
    const projects = shuttleIndex.projects.map(normalizeProject);
    projects.sort((a, b) => a.title.localeCompare(b.title));
    updateShuttle({ projects });
  } finally {
    updateShuttle({ loading: false });
  }
}
