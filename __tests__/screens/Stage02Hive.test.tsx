import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage02Hive from '../../screens/Stage02Hive';

// Mock useGeminiVision
vi.mock('../../lib/useGeminiVision', () => ({
  useGeminiVision: () => ({
    result: null,
    isAnalyzing: false,
    error: null,
    analyze: vi.fn(),
    reset: vi.fn(),
  }),
}));

// Robust Audio mock
const mockAudioPlay = vi.fn().mockResolvedValue(undefined);
const mockAudioPause = vi.fn();
global.Audio = function () {
  return {
    play: mockAudioPlay,
    pause: mockAudioPause,
    loop: false,
    name: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
} as unknown as typeof Audio;

describe('Stage02Hive', () => {
  beforeEach(() => {
    localStorage.clear();
    const state = {
      version: 2,
      stages: Array.from({ length: 14 }).map((_, i) => ({
        stageId: i + 1,
        completed: i < 1, // Unlock Stage 2
        hintsUsed: 0
      })),
      inventory: ['Obsidian'],
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('chromaticDetectives:gameState', JSON.stringify(state));
  });

  it('renders Stage 02 Hive content when unlocked', async () => {
    renderWithProviders(<Stage02Hive />);
    // Use findAllByText to handle multiple occurrences
    const chandeliers = await screen.findAllByText(/floral chandelier/i, {}, { timeout: 5000 });
    expect(chandeliers.length).toBeGreaterThan(0);
    expect(screen.getByText(/Honeystore/i)).toBeInTheDocument();
  }, 20000);

  it('handles camera button interaction', async () => {
    renderWithProviders(<Stage02Hive />);
    await screen.findByText(/Stage 02: The Hive/i, {}, { timeout: 10000 });
    const cameraBtn = await screen.findByRole('button', { name: /camera/i });
    expect(cameraBtn).toBeInTheDocument();
  }, 20000);
});
