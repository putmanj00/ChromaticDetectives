import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import StageWrapper from '../../components/StageWrapper';

describe('StageWrapper', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '#/?mock=true';
  });

  it('locked stage shows "LOCKED" text', () => {
    // Stage 5 requires stages 1-4 complete. With no unlock, stage 5 is locked.
    renderWithProviders(
      <StageWrapper stageId={5}>
        {() => (
          <div>Stage 5 content</div>
        )}
      </StageWrapper>
    );

    expect(screen.getByText(/LOCKED/)).toBeInTheDocument();
    expect(screen.queryByText('Stage 5 content')).not.toBeInTheDocument();
  });

  it('unlocked stage renders children', () => {
    // Unlock stages 1-5 so stage 6 is accessible
    window.location.hash = '#/?mock=true&unlock=5';

    renderWithProviders(
      <StageWrapper stageId={6}>
        {() => (
          <div>Stage 6 content</div>
        )}
      </StageWrapper>
    );

    expect(screen.getByText('Stage 6 content')).toBeInTheDocument();
  });

  it('customLayout with completion shows fixed overlay with "Next Clue Decoded"', async () => {
    // Stage 1 is always unlocked
    window.location.hash = '#/?mock=true';

    renderWithProviders(
      <StageWrapper stageId={1} customLayout>
        {({ onComplete }) => <button onClick={onComplete}>Complete</button>}
      </StageWrapper>
    );

    // Click the complete button
    fireEvent.click(screen.getByText('Complete'));

    // The clue panel overlay should appear with "Next Clue Decoded" text
    await waitFor(() => {
      expect(screen.getByText('Next Clue Decoded')).toBeInTheDocument();
    });
  });
});
