import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage10Fog from '../../screens/Stage10Fog';

// Robust Audio mock as a constructor
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

describe('Stage10Fog', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=9'; // Unlock Stage 09 completion -> Stage 10 active
  });

  it('renders stage 10 content with fog cleanse button', () => {
    renderWithProviders(<Stage10Fog />);
    expect(screen.getByText('filter_tilt_shift')).toBeInTheDocument();
    expect(screen.getByText(/Knock to cleanse area/i)).toBeInTheDocument();
  });

  it('shows AREA CLEANSED after tapping the button 5 times', async () => {
    renderWithProviders(<Stage10Fog />);

    const button = screen.getByText('filter_tilt_shift').closest('button')!;
    expect(button).toBeInTheDocument();

    // Tap 5 times
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        fireEvent.click(button);
      }
    });

    await waitFor(() => {
      expect(screen.getByText('AREA CLEANSED')).toBeInTheDocument();
    });
  });

  it('does not complete after only 3 taps and shows remaining count', async () => {
    renderWithProviders(<Stage10Fog />);

    const button = screen.getByText('filter_tilt_shift').closest('button')!;

    await act(async () => {
      for (let i = 0; i < 3; i++) {
        fireEvent.click(button);
      }
    });

    expect(screen.queryByText('AREA CLEANSED')).not.toBeInTheDocument();
    // Should show 2 remaining
    expect(screen.getByText(/2 remaining/i)).toBeInTheDocument();
  });
});
