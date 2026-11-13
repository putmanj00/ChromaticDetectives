import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HintPanel from '../../components/HintPanel';

describe('HintPanel', () => {
  it('with 0 hints and canShowNext=true shows "Request Intel" button', () => {
    const onRequestHint = vi.fn();
    render(
      <HintPanel
        visibleHints={[]}
        canShowNext={true}
        onRequestHint={onRequestHint}
      />
    );

    expect(screen.getByText('Request Intel')).toBeInTheDocument();
    expect(screen.getByText('Intel (0/3)')).toBeInTheDocument();
  });

  it('with 2 hints shows "Intel (2/3)" and hint text', () => {
    const onRequestHint = vi.fn();
    render(
      <HintPanel
        visibleHints={['First hint text', 'Second hint text']}
        canShowNext={true}
        onRequestHint={onRequestHint}
      />
    );

    expect(screen.getByText('Intel (2/3)')).toBeInTheDocument();
    expect(screen.getByText('First hint text')).toBeInTheDocument();
    expect(screen.getByText('Second hint text')).toBeInTheDocument();
  });

  it('clicking "Request Intel" calls the onRequestHint callback', () => {
    const onRequestHint = vi.fn();
    render(
      <HintPanel
        visibleHints={[]}
        canShowNext={true}
        onRequestHint={onRequestHint}
      />
    );

    fireEvent.click(screen.getByText('Request Intel'));
    expect(onRequestHint).toHaveBeenCalledTimes(1);
  });

  it('with 0 hints and canShowNext=false returns null (nothing rendered)', () => {
    const { container } = render(
      <HintPanel
        visibleHints={[]}
        canShowNext={false}
        onRequestHint={vi.fn()}
      />
    );

    expect(container.innerHTML).toBe('');
  });
});
