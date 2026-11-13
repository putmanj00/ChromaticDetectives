import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage15Omega from '../../screens/Stage15Omega';

describe('Stage15Omega', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=14';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the "VIEW FINAL MESSAGE" button', () => {
    renderWithProviders(<Stage15Omega />);
    expect(screen.getByText('VIEW FINAL MESSAGE')).toBeInTheDocument();
  });

  it('plays video when play button is clicked', async () => {
    renderWithProviders(<Stage15Omega />);

    // Find play button
    const playButton = screen.getByRole('button', { name: /play_arrow/i });
    fireEvent.click(playButton);

    // Video should appear
    // Video element might be tricky to query directly without mocking, but if it has controls it should be visible. Or just query by tag name if possible, or assume it replaces the button.
    // Wait, <video> tag has no specific role by default unless controls enabled. It has controls.
    // However, usually we mock video in tests.
    // Let's just check if it renders the video element or if the play button disappears.
    // Or check if the video source is correct.
    const videoElement = document.querySelector('video');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('src', '/Video_Generation_Crystal_Finale.mp4');
  });

  it('clicking "VIEW FINAL MESSAGE" then "SKIP >>" shows the full message', () => {
    renderWithProviders(<Stage15Omega />);

    // Click the view final message button
    fireEvent.click(screen.getByText('VIEW FINAL MESSAGE'));

    // Advance a small amount so the typewriter starts but hasn't finished
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // The SKIP button should appear during typing
    const skipButton = screen.getByText('SKIP >>');
    expect(skipButton).toBeInTheDocument();

    // Click SKIP to set the full message immediately
    fireEvent.click(skipButton);

    // Advance past the 800ms timeout for onComplete
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Verify the full message is displayed
    const fullMessage = "14 years of data, fully decoded. Every frequency, every cipher, every moment has led us here. This was about remembering what's special. Remembering why every single year has mattered. I love you so much. Thank you for 14 wonderful years, and I can't wait to go on more adventures with you in the future!.";
    expect(screen.getByText(fullMessage)).toBeInTheDocument();
  });
});
