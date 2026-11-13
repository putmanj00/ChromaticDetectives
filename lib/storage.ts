import { GameState, StageProgress } from './types';
import { STAGES } from './stages';

const STORAGE_KEY = 'chromaticDetectives:gameState';
const CURRENT_VERSION = 2;

function createDefaultProgress(): StageProgress[] {
  return STAGES.map((stage) => ({
    stageId: stage.id,
    completed: false,
    hintsUsed: 0,
  }));
}

function createDefaultGameState(): GameState {
  return {
    version: CURRENT_VERSION,
    stages: createDefaultProgress(),
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    mockMode: false,
    inventory: [],
  };
}

export function loadGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultGameState();

    const parsed = JSON.parse(raw) as GameState;

    // Version mismatch: stages were reordered, reset progress
    if ((parsed.version ?? 1) < CURRENT_VERSION) {
      return createDefaultGameState();
    }

    // Validate structure
    if (!parsed.stages || !Array.isArray(parsed.stages)) {
      return createDefaultGameState();
    }

    // Ensure all stages exist (handles version upgrades)
    const existingIds = new Set(parsed.stages.map((s) => s.stageId));
    for (const stage of STAGES) {
      if (!existingIds.has(stage.id)) {
        parsed.stages.push({
          stageId: stage.id,
          completed: false,
          hintsUsed: 0,
        });
      }
    }

    return parsed;
  } catch {
    return createDefaultGameState();
  }
}

export function saveGameState(state: GameState): void {
  state.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markStageComplete(stageId: number): GameState {
  const state = loadGameState();
  const stage = state.stages.find((s) => s.stageId === stageId);
  if (stage) {
    stage.completed = true;
    stage.completedAt = new Date().toISOString();
  }
  saveGameState(state);
  return state;
}

export function updateHintsUsed(stageId: number, hintsUsed: number): GameState {
  const state = loadGameState();
  const stage = state.stages.find((s) => s.stageId === stageId);
  if (stage) {
    stage.hintsUsed = hintsUsed;
  }
  saveGameState(state);
  return state;
}

export function resetProgress(): GameState {
  const state = createDefaultGameState();
  saveGameState(state);
  return state;
}

export function getStageProgress(stageId: number): StageProgress | undefined {
  const state = loadGameState();
  return state.stages.find((s) => s.stageId === stageId);
}

// New shard tracking
const NEW_SHARDS_KEY = 'chromaticDetectives:newShards';

export function getNewShards(): number[] {
  try {
    const raw = localStorage.getItem(NEW_SHARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

export function addNewShard(stageId: number): void {
  const shards = getNewShards();
  if (!shards.includes(stageId)) {
    shards.push(stageId);
    localStorage.setItem(NEW_SHARDS_KEY, JSON.stringify(shards));
  }
}

export function clearNewShards(): void {
  localStorage.removeItem(NEW_SHARDS_KEY);
}
