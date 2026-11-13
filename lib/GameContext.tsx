import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameState, StageProgress, StageStatus } from './types';
import { STAGES } from './stages';
import { loadGameState, saveGameState, resetProgress as resetStorage, getNewShards, addNewShard, clearNewShards } from './storage';

interface GameContextType {
  gameState: GameState;
  completeStage: (stageId: number) => void;
  isStageUnlocked: (stageId: number) => boolean;
  getStageStatus: (stageId: number) => StageStatus;
  getActiveStageId: () => number;
  getStageProgress: (stageId: number) => StageProgress | undefined;
  updateHintsUsed: (stageId: number, count: number) => void;
  resetGame: () => void;
  resetStage: (stageId: number) => void;
  forceUnlock: (stageId: number) => void;
  collectItem: (item: string) => void;
  inventory: string[];
  devMode: boolean;
  completedCount: number;
  totalStages: number;
  newShardCount: number;
  markShardsViewed: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => {
    let state = loadGameState();
    const hashParts = window.location.hash.split('?');
    const params = new URLSearchParams(hashParts[1] || '');

    const unlockId = params.get('unlock');
    if (unlockId) {
      const id = parseInt(unlockId, 10);
      if (!isNaN(id) && id >= 1 && id <= STAGES.length) {
        state = { ...state, stages: state.stages.map((s) => ({ ...s })), inventory: state.inventory ? [...state.inventory] : [] };
        for (const sp of state.stages) {
          if (sp.stageId <= id) {
            sp.completed = true;
            sp.completedAt = sp.completedAt || new Date().toISOString();
          }
        }
        saveGameState(state);
      }
    }

    if (!state.inventory) {
      state = { ...state, inventory: [] };
    }

    if (params.get('reset') === 'true') {
      state = resetStorage();
    }

    return state;
  });

  const [newShardCount, setNewShardCount] = useState<number>(() => getNewShards().length);

  const [devMode] = useState<boolean>(() => {
    const hashParts = window.location.hash.split('?');
    const params = new URLSearchParams(hashParts[1] || '');
    return params.get('dev') === 'true';
  });

  // Empty useEffect to satisfy lint if needed, or remove if unused
  useEffect(() => {
    // Hash commands are now handled in initial state to ensure synchronous unlocking for tests
  }, []);

  const completeStage = useCallback((stageId: number) => {
    setGameState((prev) => {
      const next = { ...prev, stages: prev.stages.map((s) => ({ ...s })) };
      const stage = next.stages.find((s) => s.stageId === stageId);
      if (stage && !stage.completed) {
        stage.completed = true;
        stage.completedAt = new Date().toISOString();

        // Award items based on stage
        let newItem = '';
        if (stageId === 1) newItem = 'Obsidian';
        else if (stageId === 2) newItem = 'Citrine';
        else if (stageId === 3) newItem = 'Rose Quartz';
        else if (stageId === 5) newItem = 'Prism Gaze Video';
        else if (stageId === 6) newItem = 'Couple Video';

        if (newItem && !next.inventory.includes(newItem)) {
          next.inventory = [...next.inventory, newItem];
        }

        // Track new shard for badge
        addNewShard(stageId);
        setNewShardCount(getNewShards().length);
      }
      saveGameState(next);
      return next;
    });
  }, []);

  const isStageUnlocked = useCallback(
    (stageId: number): boolean => {
      // Stage 1 is always unlocked
      if (stageId === 1) return true;
      // Stage N is unlocked if stage N-1 is completed
      const prevStage = gameState.stages.find((s) => s.stageId === stageId - 1);
      return prevStage?.completed === true;
    },
    [gameState]
  );

  const getStageStatus = useCallback(
    (stageId: number): StageStatus => {
      const progress = gameState.stages.find((s) => s.stageId === stageId);
      if (progress?.completed) return 'completed';
      if (!isStageUnlocked(stageId)) return 'locked';
      // The first non-completed unlocked stage is "active"
      const activeId = getActiveStageIdFromState(gameState);
      if (stageId === activeId) return 'active';
      return 'unlocked';
    },
    [gameState, isStageUnlocked]
  );

  const getActiveStageId = useCallback((): number => {
    return getActiveStageIdFromState(gameState);
  }, [gameState]);

  const getStageProgressFn = useCallback(
    (stageId: number): StageProgress | undefined => {
      return gameState.stages.find((s) => s.stageId === stageId);
    },
    [gameState]
  );

  const updateHintsUsed = useCallback((stageId: number, count: number) => {
    setGameState((prev) => {
      const next = { ...prev, stages: prev.stages.map((s) => ({ ...s })) };
      const stage = next.stages.find((s) => s.stageId === stageId);
      if (stage) {
        stage.hintsUsed = count;
      }
      saveGameState(next);
      return next;
    });
  }, []);

  const resetGame = useCallback(() => {
    const fresh = resetStorage();
    setGameState(fresh);
  }, []);

  const forceUnlock = useCallback((stageId: number) => {
    setGameState((prev) => {
      const next = { ...prev, stages: prev.stages.map((s) => ({ ...s })) };
      // Complete all stages up to (but not including) the target
      for (const sp of next.stages) {
        if (sp.stageId < stageId) {
          if (!sp.completed) {
            sp.completed = true;
            sp.completedAt = sp.completedAt || new Date().toISOString();

            // Award items for skipped stages
            let newItem = '';
            if (sp.stageId === 1) newItem = 'Obsidian';
            else if (sp.stageId === 2) newItem = 'Citrine';
            else if (sp.stageId === 3) newItem = 'Rose Quartz';
            else if (sp.stageId === 5) newItem = 'Prism Gaze Video';
            else if (sp.stageId === 6) newItem = 'Couple Video';

            if (newItem && !next.inventory.includes(newItem)) {
              next.inventory.push(newItem);
            }
          }
        }
      }
      // Also ensure we have a functional inventory array if it was somehow undefined on valid state
      if (!next.inventory) next.inventory = [];

      saveGameState(next);
      return next;
    });
  }, []);

  const markShardsViewed = useCallback(() => {
    clearNewShards();
    setNewShardCount(0);
  }, []);

  const collectItem = useCallback((item: string) => {
    setGameState((prev) => {
      if (prev.inventory.includes(item)) return prev;
      const next = { ...prev, inventory: [...prev.inventory, item] };
      saveGameState(next);
      return next;
    });
  }, []);

  const resetStage = useCallback((stageId: number) => {
    setGameState((prev) => {
      const next = { ...prev, stages: prev.stages.map((s) => ({ ...s })), inventory: [...prev.inventory] };
      const stage = next.stages.find((s) => s.stageId === stageId);
      if (stage) {
        stage.completed = false;
        stage.completedAt = undefined;
        stage.hintsUsed = 0;
      }
      // Also reset any stages after this one (since they depend on it)
      for (const sp of next.stages) {
        if (sp.stageId > stageId) {
          sp.completed = false;
          sp.completedAt = undefined;
          sp.hintsUsed = 0;
        }
      }

      // Remove items associated with reset stages
      if (stageId <= 1) next.inventory = next.inventory.filter(i => i !== 'Obsidian');
      if (stageId <= 2) next.inventory = next.inventory.filter(i => i !== 'Citrine');
      if (stageId <= 3) next.inventory = next.inventory.filter(i => i !== 'Rose Quartz');

      saveGameState(next);
      return next;
    });
  }, []);

  const completedCount = gameState.stages.filter((s) => s.completed).length;

  return (
    <GameContext.Provider
      value={{
        gameState,
        completeStage,
        isStageUnlocked,
        getStageStatus,
        getActiveStageId,
        getStageProgress: getStageProgressFn,
        updateHintsUsed,
        resetGame,
        resetStage,
        forceUnlock,
        collectItem,
        inventory: gameState.inventory,
        devMode,
        completedCount,
        totalStages: STAGES.length,
        newShardCount,
        markShardsViewed,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}

function getActiveStageIdFromState(state: GameState): number {
  for (const stage of STAGES) {
    const progress = state.stages.find((s) => s.stageId === stage.id);
    if (!progress?.completed) return stage.id;
  }
  return STAGES.length; // All completed, return last
}
