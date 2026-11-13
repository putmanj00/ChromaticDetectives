import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(),
  Modality: { AUDIO: 'AUDIO' },
}));

import Stage03Tuner from '../../screens/Stage03Tuner';

describe('Stage03Tuner', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=2';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AudioContext = class MockAudioContext {
      sampleRate = 24000;
      state = 'running';
      destination = {};
      createGain() {
        return { connect: vi.fn(), gain: { value: 1, setTargetAtTime: vi.fn(), setValueAtTime: vi.fn() } };
      }
      createBufferSource() {
        return { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), buffer: null, onended: null, loop: false };
      }
      createBuffer() {
        return { getChannelData: () => new Float32Array(48000) };
      }
      close() { return Promise.resolve(); }
      resume() { return Promise.resolve(); }
    };
  });

  it('renders without crash with initial frequency', () => {
    renderWithProviders(<Stage03Tuner />);
    expect(screen.getByText('13.50')).toBeInTheDocument();
    expect(screen.getByText('MHz')).toBeInTheDocument();
    expect(screen.getByText('STAGE 03')).toBeInTheDocument();
  });

  it('+/- buttons are visible but disabled before broadcast', () => {
    renderWithProviders(<Stage03Tuner />);

    const removeIcon = screen.getByText('remove');
    const leftButton = removeIcon.closest('button')!;
    const addIcon = screen.getByText('add');
    const rightButton = addIcon.closest('button')!;

    // Buttons should be disabled before broadcast
    expect(leftButton).toBeDisabled();
    expect(rightButton).toBeDisabled();
  });

  it('shows BROADCAST label before starting', () => {
    renderWithProviders(<Stage03Tuner />);
    const broadcasts = screen.getAllByText('BROADCAST');
    expect(broadcasts.length).toBeGreaterThanOrEqual(1);
  });
});
