import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage13Mushrooms from '../../screens/Stage13Mushrooms';

describe('Stage13Mushrooms', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=12';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the 5 mushroom buttons', () => {
    renderWithProviders(<Stage13Mushrooms />);
    expect(screen.getByText('AMANITA')).toBeInTheDocument();
    expect(screen.getByText('CORTINAR')).toBeInTheDocument();
    expect(screen.getByText('CHANTERL')).toBeInTheDocument();
    expect(screen.getByText('MYCENA')).toBeInTheDocument();
    expect(screen.getByText('LACCARIA')).toBeInTheDocument();
  });

  it('clicking in correct spectral order transitions to camera phase', () => {
    renderWithProviders(<Stage13Mushrooms />);

    // Correct order: red (AMANITA), orange (CORTINAR), yellow (CHANTERL), green (MYCENA), blue (LACCARIA)
    const correctOrder = ['AMANITA', 'CORTINAR', 'CHANTERL', 'MYCENA', 'LACCARIA'];
    for (const label of correctOrder) {
      const labelEl = screen.getByText(label);
      const button = labelEl.closest('button');
      expect(button).toBeTruthy();
      fireEvent.click(button!);
    }

    // Advance past the 400ms timeout for setSequenceComplete
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now in camera phase, not auto-completed
    expect(screen.getAllByText(/PHOTOGRAPH THE OWL/).length).toBeGreaterThanOrEqual(1);
  });

  it('clicking in wrong order causes reset', () => {
    renderWithProviders(<Stage13Mushrooms />);

    // Click blue first (wrong order, should be red first)
    const blueBtn = screen.getByText('LACCARIA').closest('button');
    fireEvent.click(blueBtn!);

    // Advance past the 800ms shake/reset timeout
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('COLLECT IN SPECTRAL ORDER')).toBeInTheDocument();
    expect(screen.queryByText(/PHOTOGRAPH THE OWL/)).not.toBeInTheDocument();
  });

  it('allows scrolling (does not have touch-none)', () => {
    const { container } = renderWithProviders(<Stage13Mushrooms />);
    // Ensure the main container does NOT have touch-none
    // We can check the first div or specific container
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).not.toHaveClass('touch-none');
    // Or check if it has overflow-y-auto if we added it?
    // In Stage13Mushrooms.tsx changes, we removed touch-none. We didn't explicitly add overflow-y-auto, but standard layout allows scrolling if content overflows.
    // Let's just check for absence of touch-none.
  });
});
