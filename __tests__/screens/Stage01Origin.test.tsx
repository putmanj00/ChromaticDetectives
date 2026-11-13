import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(),
}));

import Stage01Origin from '../../screens/Stage01Origin';

describe('Stage01Origin', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true';
    // Mock AudioContext as a constructor
    vi.stubGlobal('AudioContext', vi.fn().mockImplementation(function () {
      return {
        close: vi.fn(),
        createGain: vi.fn().mockReturnValue({ connect: vi.fn() }),
        createBufferSource: vi.fn().mockReturnValue({ connect: vi.fn(), start: vi.fn() }),
        resume: vi.fn(),
        state: 'suspended',
        destination: {},
      };
    }));
  });

  it('renders without crash', () => {
    renderWithProviders(<Stage01Origin />);
    expect(screen.getByText('Stage_01: Origin', { exact: false })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ENTER_CODE')).toBeInTheDocument();
  });

  it('entering correct code 0XAC3CFE unlocks the play button', async () => {
    renderWithProviders(<Stage01Origin />);
    const input = screen.getByPlaceholderText('ENTER_CODE');

    act(() => {
      fireEvent.change(input, { target: { value: '0XAC3CFE' } });
    });

    const playButton = screen.getByText('play_arrow').closest('button')!;
    expect(playButton).not.toBeDisabled();
    expect(screen.getByText('Feed_Encrypted')).toBeInTheDocument();
  });

  it('incorrect code keeps play button locked', () => {
    renderWithProviders(<Stage01Origin />);
    const input = screen.getByPlaceholderText('ENTER_CODE');

    act(() => {
      fireEvent.change(input, { target: { value: 'WRONG' } });
    });

    const lockButton = screen.getByText('lock').closest('button')!;
    expect(lockButton).toBeDisabled();
    expect(screen.getByText('Authenticating...')).toBeInTheDocument();
  });
});
