import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage05Hierophany from '../../screens/Stage05Hierophany';

describe('Stage05Hierophany (camera + vision)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=4';
  });

  it('renders without crash when unlocked', async () => {
    renderWithProviders(<Stage05Hierophany />);

    // Wait for video generation to finish and "Synchronize Reality" button to appear
    await screen.findByText("Synchronize Reality", {}, { timeout: 3000 });

    // Click to enter reality
    const syncButton = screen.getByText("Synchronize Reality");
    syncButton.click();

    // Now check for main stage content
    expect(await screen.findByText('STAGE 05: HIEROPHANY')).toBeInTheDocument();
  });

  it('shows camera button for ink verification', async () => {
    renderWithProviders(<Stage05Hierophany />);

    // Wait for and click sync button
    await screen.findByText("Synchronize Reality", {}, { timeout: 3000 });
    screen.getByText("Synchronize Reality").click();

    // Check for camera button
    expect((await screen.findAllByText('videocam')).length).toBeGreaterThanOrEqual(1);
  });
});
