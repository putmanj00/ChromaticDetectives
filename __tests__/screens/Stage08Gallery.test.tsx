import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act, within } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage08Gallery from '../../screens/Stage08Gallery';

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

// Mock CameraCapture
vi.mock('../../components/CameraCapture', () => ({
  default: ({ onCapture, children }: { onCapture: (img: string) => void; children?: React.ReactNode }) => (
    <div data-testid="camera-capture">
      <button onClick={() => onCapture('test-image')}>Capture</button>
      {children}
    </div>
  )
}));

// Mock evaluate photo
vi.mock('../../lib/useGeminiVision', () => ({
  useGeminiVision: () => ({
    analyze: vi.fn().mockResolvedValue({ isMatch: true, description: 'Matched' }),
    result: null,
    isAnalyzing: false,
    error: null,
    reset: vi.fn(),
    manualConfirm: vi.fn()
  })
}));

describe('Stage08Gallery', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=7';
  });

  it('renders stage 8 teaser content', async () => {
    renderWithProviders(<Stage08Gallery />);
    const main = await screen.findByRole('main');
    // Scoped within main to avoid duplicate title in header
    expect(within(main).getByText(/GALLERY SEARCH/i)).toBeInTheDocument();
    expect(within(main).getByText(/I FOUND IT/i)).toBeInTheDocument();
  });

  it('opens camera when "I FOUND IT" is clicked', async () => {
    renderWithProviders(<Stage08Gallery />);
    const main = await screen.findByRole('main');
    const button = within(main).getByText(/I FOUND IT/i);

    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText(/ALIGN WITH PAINTING/i)).toBeInTheDocument();
  });
});
