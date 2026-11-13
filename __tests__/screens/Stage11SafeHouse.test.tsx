import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage11SafeHouse from '../../screens/Stage11SafeHouse';

describe('Stage11SafeHouse', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=10';
  });

  it('renders the keypad and submit button', () => {
    renderWithProviders(<Stage11SafeHouse />);
    expect(screen.getByText('Submit Coordinates')).toBeInTheDocument();
    // Verify number buttons 0-9 exist
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('entering correct code 48214 and submitting shows "Coordinates Unlocked"', async () => {
    renderWithProviders(<Stage11SafeHouse />);

    // Click 4, 8, 2, 1, 4
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    fireEvent.click(screen.getByText('Submit Coordinates'));

    await waitFor(() => {
      expect(screen.getByText('Coordinates Unlocked')).toBeInTheDocument();
    });
  });

  it('entering wrong code sets error state', async () => {
    renderWithProviders(<Stage11SafeHouse />);

    // Click 1, 2, 3, 4, 5 (wrong code)
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: '5' }));

    fireEvent.click(screen.getByText('Submit Coordinates'));

    // The submit button should still say "Submit Coordinates" (not unlocked)
    expect(screen.getByText('Submit Coordinates')).toBeInTheDocument();
    expect(screen.queryByText('Coordinates Unlocked')).not.toBeInTheDocument();
  });
});
