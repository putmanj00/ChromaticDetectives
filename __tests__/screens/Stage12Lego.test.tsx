import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage12Lego from '../../screens/Stage12Lego';

describe('Stage12Lego', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=11';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the stage with 5 brick buttons', () => {
    renderWithProviders(<Stage12Lego />);
    // Each brick has an icon: data_object, view_in_ar, memory, hub, diamond
    // view_in_ar appears twice (brick + footer nav), so use getAllByText
    expect(screen.getByText('data_object')).toBeInTheDocument();
    expect(screen.getAllByText('view_in_ar').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('memory')).toBeInTheDocument();
    expect(screen.getByText('hub')).toBeInTheDocument();
    expect(screen.getAllByText('diamond').length).toBeGreaterThanOrEqual(1);
  });

  it('clicking all 5 bricks transitions to verification phase', () => {
    renderWithProviders(<Stage12Lego />);

    // Click bricks in correct order using their unique icon text
    const brickIcons = ['data_object', 'view_in_ar', 'memory', 'hub', 'diamond'];
    for (const icon of brickIcons) {
      const matches = screen.getAllByText(icon);
      // Find the one inside a brick button (not footer nav)
      const brickIcon = matches.find(el => el.closest('button[class*="absolute"]'));
      expect(brickIcon).toBeTruthy();
      const button = brickIcon!.closest('button');
      fireEvent.click(button!);
    }

    // Advance past the 400ms timeout for setBricksComplete
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now in camera verification phase, not auto-completed
    expect(screen.getByText('VERIFICATION PHASE')).toBeInTheDocument();
    expect(screen.getAllByText(/PHOTOGRAPH/i).length).toBeGreaterThanOrEqual(1);
  });

  it('allows scrolling (has overflow-y-auto)', () => {
    const { container } = renderWithProviders(<Stage12Lego />);
    const scrollableDiv = container.querySelector('.overflow-y-auto');
    expect(scrollableDiv).toBeInTheDocument();
  });
});
