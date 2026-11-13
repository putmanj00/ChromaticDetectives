import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import AdminPanel from '../../components/AdminPanel';

describe('AdminPanel', () => {
  const mockOnClose = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnForceUnlock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    vi.clearAllMocks();
  });

  it('renders with all 15 stage names', () => {
    renderWithProviders(
      <AdminPanel
        onClose={mockOnClose}
        onReset={mockOnReset}
        onForceUnlock={mockOnForceUnlock}
      />
    );

    expect(screen.getByText('ADMIN PANEL')).toBeInTheDocument();
    // Check all 15 stage titles are displayed
    expect(screen.getByText(/01 THE ORIGIN/)).toBeInTheDocument();
    expect(screen.getByText(/02 THE HIVE/)).toBeInTheDocument();
    expect(screen.getByText(/03 GOEBEL TUNING/)).toBeInTheDocument();
    expect(screen.getByText(/04 GOLDEN GELATO/)).toBeInTheDocument();
    expect(screen.getByText(/05 HIEROPHANY/)).toBeInTheDocument();
    expect(screen.getByText(/06 MINERAL SEQUENCE/)).toBeInTheDocument();
    expect(screen.getByText(/07 THE TRANSIT/)).toBeInTheDocument();
    expect(screen.getByText(/08 GALLERY SEARCH/)).toBeInTheDocument();
    expect(screen.getByText(/09 DAMASCUS CIPHER/)).toBeInTheDocument();
    expect(screen.getByText(/10 SYNDICATE FOG/)).toBeInTheDocument();
    expect(screen.getByText(/11 APOTHECARIUM/)).toBeInTheDocument();
    expect(screen.getByText(/12 MASTER BUILDER/)).toBeInTheDocument();
    expect(screen.getByText(/13 FUNGAL GLOW/)).toBeInTheDocument();
    expect(screen.getByText(/14 GLITCH TRACKER/)).toBeInTheDocument();
    expect(screen.getByText(/15 PROTOCOL OMEGA/)).toBeInTheDocument();
  });

  it('clicking "GO TO" on first stage calls onClose', () => {
    renderWithProviders(
      <AdminPanel
        onClose={mockOnClose}
        onReset={mockOnReset}
        onForceUnlock={mockOnForceUnlock}
      />
    );

    // Each stage has a "GO TO" button; click the first one
    const goToButtons = screen.getAllByText('GO TO');
    expect(goToButtons.length).toBe(15);
    fireEvent.click(goToButtons[0]);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('clicking "RESET ALL PROGRESS" then "CONFIRM RESET" calls onReset', async () => {
    renderWithProviders(
      <AdminPanel
        onClose={mockOnClose}
        onReset={mockOnReset}
        onForceUnlock={mockOnForceUnlock}
      />
    );

    // Click the reset button
    fireEvent.click(screen.getByText('RESET ALL PROGRESS'));

    // Confirm reset appears
    await waitFor(() => {
      expect(screen.getByText('CONFIRM RESET')).toBeInTheDocument();
    });

    // Click confirm
    fireEvent.click(screen.getByText('CONFIRM RESET'));

    expect(mockOnReset).toHaveBeenCalledTimes(1);
    // onClose is also called after reset
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
