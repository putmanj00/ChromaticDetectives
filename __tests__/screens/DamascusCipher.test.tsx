import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import DamascusCipher from '../../screens/DamascusCipher';

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

// Mock video interstitial
vi.mock('../../components/VideoInterstitial', () => ({
  default: ({ onComplete, title }: { onComplete: () => void; title: string }) => (
    <div data-testid="video-interstitial">
      <h1>{title}</h1>
      <button onClick={onComplete}>Complete Video</button>
    </div>
  )
}));

describe('DamascusCipher', () => {
  beforeEach(() => {
    localStorage.clear();
    const state = {
      version: 2,
      stages: Array.from({ length: 14 }).map((_, i) => ({
        stageId: i + 1,
        completed: i < 8, // Unlock Stage 9
        hintsUsed: 0
      })),
      inventory: [] as string[],
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('chromaticDetectives:gameState', JSON.stringify(state));
  });

  it('renders Damascus Cipher content', async () => {
    renderWithProviders(<DamascusCipher />);
    await screen.findByText(/DAMASCUS CIPHER/i, {}, { timeout: 10000 });
    expect(screen.getByText(/Mission Intel/i)).toBeInTheDocument();
  }, 20000);

  it('completes decryption correctly', async () => {
    renderWithProviders(<DamascusCipher />);
    await screen.findByText(/DAMASCUS CIPHER/i, {}, { timeout: 10000 });

    const titles = ['HIVE HEX', 'TUNER FORK', 'LEAF FRACTAL', 'ORIGIN SPARK', 'GOLDEN ORB', 'PIXEL CUBE', 'ELIXIR DROP', 'ALCOVE LENS'];

    for (const title of titles) {
      const btn = await screen.findByText(title);
      await act(async () => fireEvent.click(btn));
    }

    const videoBtn = await screen.findByText(/Complete Video/i, {}, { timeout: 10000 });
    await act(async () => fireEvent.click(videoBtn));

    await screen.findAllByText(/THE FADE IS REVERSED/i, {}, { timeout: 10000 });
  }, 40000);

  it('allows scrolling (has overflow-y-auto)', () => {
    const { container } = renderWithProviders(<DamascusCipher />);
    // Check if the main container has overflow-y-auto class
    // The main container is usually the first div or one with specific classes
    // In DamascusCipher.tsx, it's the div with bg-background-dark
    // We can query by class name or verify if any element has overflow-y-auto
    const scrollableDiv = container.querySelector('.overflow-y-auto');
    expect(scrollableDiv).toBeInTheDocument();
  });
});
