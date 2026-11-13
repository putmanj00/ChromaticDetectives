import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import HomeHub from '../../screens/HomeHub';

describe('HomeHub', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('renders all 15 stages in the timeline', () => {
    renderWithProviders(<HomeHub />);

    // Stage 01 is active (shows real name), rest are locked (show CLASSIFIED)
    expect(screen.getByText(/STAGE 01: THE ORIGIN/)).toBeInTheDocument();
    // Locked stages show CLASSIFIED instead of real names
    expect(screen.getByText(/STAGE 02: CLASSIFIED/)).toBeInTheDocument();
    expect(screen.getByText(/STAGE 15: CLASSIFIED/)).toBeInTheDocument();
    // Verify all 15 stage nodes exist
    const stageNodes = screen.getAllByText(/STAGE \d{2}:/);
    expect(stageNodes).toHaveLength(15);
  });

  it('progress bar shows "0%"', () => {
    renderWithProviders(<HomeHub />);
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });

  it('triple-tap title opens admin panel', async () => {
    renderWithProviders(<HomeHub />);

    // Find "THE FADE" title text (h1) and click its parent div 3 times
    const titleText = screen.getAllByText(/THE FADE/)[0];
    const clickTarget = titleText.closest('div[class]')!;
    expect(clickTarget).toBeTruthy();

    fireEvent.click(clickTarget);
    fireEvent.click(clickTarget);
    fireEvent.click(clickTarget);

    await waitFor(() => {
      expect(screen.getByText('ADMIN PANEL')).toBeInTheDocument();
    });
  });
});
