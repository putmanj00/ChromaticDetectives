export type UnlockType = 'gps' | 'scan' | 'puzzle' | 'time';

export type PuzzleType =
  | 'video-generate'
  | 'scan-progress'
  | 'frequency-dial'
  | 'ar-scan'
  | 'color-match'
  | 'press-hold'
  | 'slider-target'
  | 'hidden-code'
  | 'compass-align'
  | 'fog-clear'
  | 'keypad-code'
  | 'collect-items'
  | 'sequence-tap'
  | 'anomaly-scan'
  | 'final-reveal'
  | 'camera-vision'
  | 'mineral-sequence'
  | 'riddle-camera';

export type StageStatus = 'locked' | 'unlocked' | 'active' | 'completed';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Stage {
  id: number;
  title: string;
  subtitle: string;
  location: string;
  coordinates: Coordinates;
  route: string;
  unlockType: UnlockType;
  unlockRadius: number; // meters
  puzzleType: PuzzleType;
  puzzleConfig: Record<string, unknown>;
  hints: [string, string, string]; // 3 levels: subtle -> clear -> obvious
  clueText: string; // clue revealed on completion pointing to next stage
  timeLock?: string; // ISO time string for time-locked stages (e.g., "17:00")
}

export interface StageProgress {
  stageId: number;
  completed: boolean;
  completedAt?: string; // ISO date string
  hintsUsed: number;
}

export interface GameState {
  version?: number;
  stages: StageProgress[];
  startedAt: string;
  lastUpdated: string;
  mockMode: boolean;
  inventory: string[];
}
