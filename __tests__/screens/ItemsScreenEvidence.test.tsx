import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/renderStage';
import ItemsScreen from '../../screens/ItemsScreen';
import * as GameContext from '../../lib/GameContext';

// Mock CLUES
vi.mock('../../lib/clues', () => ({
    CLUES: [
        {
            id: '01',
            title: 'TEST CLUE 1',
            stageId: 1,
            type: 'PAPER',
            content: "Secret content 1",
            date: '09:05 AM'
        },
        {
            id: '02',
            title: 'TEST CLUE 2',
            stageId: 2,
            type: 'OBJECT',
            content: "Secret content 2",
            date: '10:12 AM'
        }
    ]
}));

describe('ItemsScreen Evidence Integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders tabs correctly', () => {
        renderWithProviders(<ItemsScreen />);
        expect(screen.getByText('Artifacts')).toBeInTheDocument();
        expect(screen.getByText('Evidence')).toBeInTheDocument();
    });

    it('switches to evidence tab', () => {
        renderWithProviders(<ItemsScreen />);
        fireEvent.click(screen.getByText('Evidence'));
        expect(screen.getByText('EVIDENCE LOG')).toBeInTheDocument();
    });

    it('shows LOCKED status for locked clues', () => {
        // Mock game state: Stage 1 complete (unlocked 2), Stage 2 locked
        vi.spyOn(GameContext, 'useGame').mockReturnValue({
            inventory: [],
            isStageUnlocked: (id: number) => id <= 2, // Stage 2 is unlocked (so stage 1 output found), Stage 3 locked
            getStageStatus: () => 'locked',
            completeStage: vi.fn(),
            resetStage: vi.fn(),
            setInventory: vi.fn(),
            devMode: false
        } as unknown as ReturnType<typeof GameContext.useGame>);

        renderWithProviders(<ItemsScreen />);
        fireEvent.click(screen.getByText('Evidence'));

        // Stage 1 clue should be FOUND because stage 2 is unlocked
        expect(screen.getByText('TEST CLUE 1')).toBeInTheDocument();

        // Stage 2 clue should be LOCKED because stage 3 is NOT unlocked
        expect(screen.getByText('ENCRYPTED DATA')).toBeInTheDocument();
        expect(screen.queryByText('TEST CLUE 2')).not.toBeInTheDocument();
    });

    it('opens modal for found clue', () => {
        vi.spyOn(GameContext, 'useGame').mockReturnValue({
            inventory: [],
            isStageUnlocked: () => true, // All unlocked
            getStageStatus: () => 'completed',
            completeStage: vi.fn(),
            resetStage: vi.fn(),
            setInventory: vi.fn(),
            devMode: false
        } as unknown as ReturnType<typeof GameContext.useGame>);

        renderWithProviders(<ItemsScreen />);
        fireEvent.click(screen.getByText('Evidence'));

        fireEvent.click(screen.getByText('TEST CLUE 1'));

        expect(screen.getByText('Message Intercepted')).toBeInTheDocument();
        expect(screen.getByText('"Secret content 1"')).toBeInTheDocument();
    });
});
