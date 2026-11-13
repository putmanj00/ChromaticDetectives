import { useState, useCallback } from 'react';
import { useGame } from './GameContext';

interface HintState {
  currentLevel: number; // 0 = none shown, 1-3 = hint level
  hints: [string, string, string];
  visibleHints: string[];
  showNextHint: () => void;
  canShowNext: boolean;
}

export function useHints(stageId: number, hints: [string, string, string]): HintState {
  const { getStageProgress, updateHintsUsed } = useGame();
  const progress = getStageProgress(stageId);
  const initialLevel = progress?.hintsUsed ?? 0;

  const [currentLevel, setCurrentLevel] = useState(initialLevel);

  const showNextHint = useCallback(() => {
    if (currentLevel < 3) {
      const next = currentLevel + 1;
      setCurrentLevel(next);
      updateHintsUsed(stageId, next);
    }
  }, [currentLevel, stageId, updateHintsUsed]);

  const visibleHints = hints.slice(0, currentLevel);
  const canShowNext = currentLevel < 3;

  return {
    currentLevel,
    hints,
    visibleHints,
    showNextHint,
    canShowNext,
  };
}
