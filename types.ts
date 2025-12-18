export enum PlayerId {
  ONE = 'ONE',
  TWO = 'TWO',
}

export enum GamePhase {
  SETUP = 'SETUP',
  AIMING = 'AIMING',
  ASSESSING = 'ASSESSING',
  PUSH_DECISION = 'PUSH_DECISION',
  RACK_OVER = 'RACK_OVER',
  MATCH_OVER = 'MATCH_OVER',
}

export enum GameType {
  EIGHT_BALL = 'EIGHT_BALL',
  ROTATION = 'ROTATION',
}

export enum ShotOutcome {
  MADE = 'MADE',
  MISSED = 'MISSED',
  SAFETY = 'SAFETY',
  FOUL = 'FOUL',
  BREAK_LEGAL = 'BREAK_LEGAL',
  BREAK_DRY = 'BREAK_DRY',
  BREAK_FOUL = 'BREAK_FOUL',
  TIME_FOUL = 'TIME_FOUL',
  WIN = 'WIN',
  EARLY_8_LOSS = 'EARLY_8_LOSS',
  PUSH_OUT = 'PUSH_OUT',
  THREE_FOUL_LOSS = 'THREE_FOUL_LOSS',
}

export type SafetyResult = 'PENDING' | 'SUCCESSFUL' | 'NEUTRAL' | 'UNSUCCESSFUL';

export enum MatchFormat {
  SINGLE = 'SINGLE',
  RACE = 'RACE',
  SET = 'SET',
}

export interface ShotEvent {
  id: string;
  playerId: PlayerId;
  outcome: ShotOutcome;
  timestamp: number;
  timeUsed: number;
  isExtensionUsed: boolean;
  safetyResult?: SafetyResult;
  rackNumber: number;
}

export interface GameSettings {
  shotTime: number;
  extensionTime: number;
  extensionsAllowed: number;
  firstShotBonus: number;
  warningTime: number;
  audioEnabled: boolean;
  breakingPlayer: PlayerId;
  format: MatchFormat;
  target: number;
  gameType: GameType;
  threeFoulRule: boolean;
}

export interface GameState {
  phase: GamePhase;
  currentPlayer: PlayerId;
  timeLeft: number;
  totalTimeForShot: number;
  isPaused: boolean;
  isBreakPrep: boolean;
  isFirstShotAfterBreak: boolean;
  p1Name: string;
  p2Name: string;
  shotHistory: ShotEvent[];
  p1Score: number;
  p2Score: number;
  currentRack: number;
  p1ExtensionsRemaining: number;
  p2ExtensionsRemaining: number;
  p1Fouls: number;
  p2Fouls: number;
  isExtensionActive: boolean;
  isFirstShotOfInning: boolean;
  winner: PlayerId | null;
  pendingSafetyIndex: number | null;
}