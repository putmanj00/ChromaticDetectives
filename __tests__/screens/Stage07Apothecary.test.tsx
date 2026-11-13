import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage11Apothecary from '../../screens/Stage11Apothecary';

describe('Stage11Apothecary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=10';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders stage 11 content with sliders and execute button', () => {
    renderWithProviders(<Stage11Apothecary />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(2);
    expect(screen.getByText('Execute Synthesis')).toBeInTheDocument();
    expect(screen.getByText('Synthesis Volume')).toBeInTheDocument();
  });

  it('shows PROTOCOL_STABILIZED when targets are reached and Execute is clicked', async () => {
    renderWithProviders(<Stage11Apothecary />);

    const sliders = screen.getAllByRole('slider');
    const volumeSlider = sliders[0];
    const tempSlider = sliders[1];

    // Change sliders to target values: Volume 72, Temp 14
    act(() => {
      fireEvent.change(volumeSlider, { target: { value: '72' } });
      fireEvent.change(tempSlider, { target: { value: '14' } });
    });

    // Click Execute Synthesis
    act(() => {
      fireEvent.click(screen.getByText('Execute Synthesis'));
    });

    // Advance 1s for synthesis simulation
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText('PROTOCOL_STABILIZED')).toBeInTheDocument();
  });

  it('stays on "Execute Synthesis" when targets are not reached', async () => {
    renderWithProviders(<Stage11Apothecary />);

    // Click Execute without moving sliders (defaults: 50, 25)
    act(() => {
      fireEvent.click(screen.getByText('Execute Synthesis'));
    });

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText('Execute Synthesis')).toBeInTheDocument();
    expect(screen.queryByText('PROTOCOL_STABILIZED')).not.toBeInTheDocument();
  });
});
