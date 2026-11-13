import { describe, it, expect, beforeEach } from 'vitest';
import { loadGameState, saveGameState, markStageComplete, resetProgress, getStageProgress } from '../../lib/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadGameState returns default state when empty', () => {
    const state = loadGameState();
    expect(state.stages).toHaveLength(15);
    expect(state.stages.every((s) => !s.completed)).toBe(true);
  });

  it('saveGameState and loadGameState round-trip', () => {
    const state = loadGameState();
    state.stages[0].completed = true;
    saveGameState(state);

    const loaded = loadGameState();
    expect(loaded.stages[0].completed).toBe(true);
    expect(loaded.stages[1].completed).toBe(false);
  });

  it('markStageComplete marks the right stage', () => {
    const state = markStageComplete(3);
    expect(state.stages.find((s) => s.stageId === 3)?.completed).toBe(true);
    expect(state.stages.find((s) => s.stageId === 3)?.completedAt).toBeTruthy();
    expect(state.stages.find((s) => s.stageId === 2)?.completed).toBe(false);
  });

  it('resetProgress clears all progress', () => {
    markStageComplete(1);
    markStageComplete(2);
    const state = resetProgress();
    expect(state.stages.every((s) => !s.completed)).toBe(true);
  });

  it('getStageProgress returns the correct stage', () => {
    markStageComplete(5);
    const progress = getStageProgress(5);
    expect(progress?.completed).toBe(true);
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('chromaticDetectives:gameState', 'not json');
    const state = loadGameState();
    expect(state.stages).toHaveLength(15);
  });

  it('handles missing stages array gracefully', () => {
    localStorage.setItem('chromaticDetectives:gameState', JSON.stringify({ foo: 'bar' }));
    const state = loadGameState();
    expect(state.stages).toHaveLength(15);
  });
});
