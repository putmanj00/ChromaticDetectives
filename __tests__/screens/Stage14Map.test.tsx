import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage14Map from '../../screens/Stage14Map';

describe('Stage14Map', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=13';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all 3 anomaly buttons', () => {
    renderWithProviders(<Stage14Map />);
    expect(screen.getByText('FREQ_RIFT_01')).toBeInTheDocument();
    expect(screen.getByText('VOID_ECHO_02')).toBeInTheDocument();
    expect(screen.getByText('GLITCH_NODE_03')).toBeInTheDocument();
  });

  it('clicking all 3 anomalies transitions to question phase', () => {
    renderWithProviders(<Stage14Map />);

    const anomalyNames = ['FREQ_RIFT_01', 'VOID_ECHO_02', 'GLITCH_NODE_03'];
    for (const name of anomalyNames) {
      const label = screen.getByText(name);
      const button = label.closest('button');
      expect(button).toBeTruthy();
      fireEvent.click(button!);
    }

    // Advance past the 400ms timeout for setAnomaliesPurified
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now in question phase, not auto-completed
    expect(screen.getAllByText(/FINAL VERIFICATION/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/What is my nickname for you/)).toBeInTheDocument();
  });

  it('renders the menu bar (navigation)', () => {
    renderWithProviders(<Stage14Map />);
    // The menu bar is rendered as a div, not a nav tag.
    // Check for "HUB" and "MAP" text which are in the bottom nav.
    expect(screen.getByText('HUB')).toBeInTheDocument();
    expect(screen.getByText('MAP')).toBeInTheDocument();
  });
});
