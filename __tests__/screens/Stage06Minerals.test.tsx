import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage06Minerals from '../../screens/Stage06Minerals';

// Robust Audio mock
const mockAudioPlay = vi.fn().mockResolvedValue(undefined);
const mockAudioPause = vi.fn();
global.Audio = function () {
  return {
    play: mockAudioPlay,
    pause: mockAudioPause,
    loop: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
} as unknown as typeof Audio;

// Mock video interstitial
vi.mock('../../components/VideoInterstitial', () => ({
  default: ({ onComplete, title }: { onComplete: () => void; title: string }) => (
    <div data-testid="video-interstitial">
      <h1>{title}</h1>
      <button onClick={onComplete}>Complete Video</button>
    </div>
  )
}));

describe('Stage06Minerals', () => {
  beforeEach(() => {
    localStorage.clear();
    const state = {
      version: 2,
      stages: Array.from({ length: 14 }).map((_, i) => ({
        stageId: i + 1,
        completed: i < 5, // Unlock Stage 6
        hintsUsed: 0
      })),
      inventory: ['Obsidian', 'Citrine', 'Rose Quartz', 'Prism Gaze Video'],
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('chromaticDetectives:gameState', JSON.stringify(state));
  });

  it('renders the mineral identification interface', async () => {
    renderWithProviders(<Stage06Minerals />);
    await screen.findByText(/MINERAL_ID_MODE/i, {}, { timeout: 10000 });
    expect(screen.getByText(/REF_ID: 404-OB/i)).toBeInTheDocument();
  }, 20000);

  it('completes the sequence correctly', async () => {
    renderWithProviders(<Stage06Minerals />);
    await screen.findByText(/MINERAL_ID_MODE/i, {}, { timeout: 10000 });

    const obsBtn = await screen.findByText(/Obsidian/i);
    const citBtn = await screen.findByText(/Citrine/i);
    const roseBtn = await screen.findByText(/Rose Quartz/i);

    await act(async () => fireEvent.click(obsBtn));
    await act(async () => fireEvent.click(citBtn));
    await act(async () => fireEvent.click(roseBtn));

    const videoBtn = await screen.findByText(/Complete Video/i, {}, { timeout: 10000 });
    await act(async () => fireEvent.click(videoBtn));

    // Check for the completed state text
    // The video plays for 1s before showing interstitial, then we click Complete
    // Then onComplete updates state.
    await screen.findAllByText(/DECODED/i, {}, { timeout: 15000 });
  }, 30000);
});
