import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import Stage07Bridge from '../../screens/Stage07Bridge';

describe('Stage07Bridge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    window.location.hash = '#/?mock=true&unlock=6';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders stage 7 content with trivia question when unlocked', () => {
    renderWithProviders(<Stage07Bridge />);
    expect(screen.getByText('TRIVIA REQUIRED')).toBeInTheDocument();
    expect(screen.getByText(/in what year was Protocol 14 initiated/)).toBeInTheDocument();
  });

  it('answering trivia correctly reveals fingerprint scanner', () => {
    renderWithProviders(<Stage07Bridge />);

    const input = screen.getByPlaceholderText(/answer/i);
    act(() => {
      fireEvent.change(input, { target: { value: '2012' } });
    });

    const submitBtn = screen.getByText('SUBMIT');
    act(() => {
      fireEvent.click(submitBtn);
    });

    // After correct trivia, fingerprint scanner becomes visible
    expect(screen.getByText('fingerprint')).toBeInTheDocument();
    expect(screen.getByText(/BIO-METRIC HANDSHAKE/)).toBeInTheDocument();
  });

  it('shows ACCESS GRANTED after holding fingerprint for 3 seconds', () => {
    renderWithProviders(<Stage07Bridge />);

    // First answer trivia
    const input = screen.getByPlaceholderText(/answer/i);
    act(() => {
      fireEvent.change(input, { target: { value: '2012' } });
    });
    act(() => {
      fireEvent.click(screen.getByText('SUBMIT'));
    });

    // Now hold fingerprint
    const fingerprintButton = screen.getByText('fingerprint').closest('button')!;
    act(() => {
      fireEvent.mouseDown(fingerprintButton);
    });

    act(() => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.getByText('ACCESS GRANTED')).toBeInTheDocument();
  });
});
