import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage04Gelato from '../../screens/Stage04Gelato';

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

describe('Stage04Gelato', () => {
  beforeEach(() => {
    localStorage.clear();
    // Unlock stages 1, 2, 3 to make Stage 4 active
    const state = {
      version: 2,
      stages: [
        { stageId: 1, completed: true },
        { stageId: 2, completed: true },
        { stageId: 3, completed: true },
        { stageId: 4, completed: false },
      ],
      inventory: ['Obsidian', 'Citrine', 'Rose Quartz'],
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('chromaticDetectives:gameState', JSON.stringify(state));
  });

  it('renders stage 4 contents', async () => {
    renderWithProviders(<Stage04Gelato />);
    await screen.findByText(/MATCHING FLAVOR FREQUENCIES/i, {}, { timeout: 10000 });
    expect(screen.getByText(/Blood Orange/i)).toBeInTheDocument();
  }, 15000);

  it('allows assigning items and completes the puzzle', async () => {
    renderWithProviders(<Stage04Gelato />);
    await screen.findByText(/MATCHING FLAVOR FREQUENCIES/i);

    // Click flavor orbs
    const bloodOrange = await screen.findByText(/Blood Orange/i);
    const blackberry = await screen.findByText(/Blackberry/i);
    const lemon = await screen.findByText(/Lemon/i);
    const mint = await screen.findByText(/Mint/i);

    // Correct mapping: Blood Orange -> slot 0, Mint -> slot 1, Blackberry -> slot 2, Lemon -> slot 3
    // We'll just click them and assign to slots

    // Assign Blood Orange to slot 0
    await act(async () => fireEvent.click(bloodOrange));
    const slots = screen.getAllByRole('button').filter(b => b.textContent?.includes('#'));
    await act(async () => fireEvent.click(slots[0]));

    // Assign Mint to slot 1
    await act(async () => fireEvent.click(mint));
    await act(async () => fireEvent.click(slots[1]));

    // Assign Blackberry to slot 2
    await act(async () => fireEvent.click(blackberry));
    await act(async () => fireEvent.click(slots[2]));

    // Assign Lemon to slot 3
    await act(async () => fireEvent.click(lemon));
    await act(async () => fireEvent.click(slots[3]));

    const syncButton = screen.getByText(/INITIALIZE SYNC/i);
    await act(async () => {
      fireEvent.click(syncButton);
    });

    // Wait for success
    await screen.findByText(/FREQUENCIES ALIGNED/i, {}, { timeout: 10000 });
  }, 25000);
});
