import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GameProvider } from '../../lib/GameContext';

/**
 * Renders a component wrapped in GameProvider + MemoryRouter.
 * Use for testing stage screens and components that depend on game context + routing.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/' }: { route?: string } = {}
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <GameProvider>{ui}</GameProvider>
    </MemoryRouter>
  );
}
