import { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, GameSettings, GameState, PlayerId, ShotEvent, ShotOutcome, SafetyResult, MatchFormat, GameType } from '../types';
import { speak, playBeep } from '../utils/sound';

const INITIAL_SETTINGS: GameSettings = {
  shotTime: 60,
  extensionTime: 30,
  extensionsAllowed: 1,
  firstShotBonus: 15,
  warningTime: 10,
  audioEnabled: true,
  breakingPlayer: PlayerId.ONE,
  format: MatchFormat.SINGLE,
  target: 1,
  gameType: GameType.EIGHT_BALL,
  threeFoulRule: false,
};

const INITIAL_STATE: GameState = {
  phase: GamePhase.SETUP,
  currentPlayer: PlayerId.ONE,
  timeLeft: 60,
  totalTimeForShot: 60,
  isPaused: false,
  isBreakPrep: true,
  isFirstShotAfterBreak: false,
  p1Name: 'Player 1',
  p2Name: 'Player 2',
  shotHistory: [],
  p1Score: 0,
  p2Score: 0,
  currentRack: 1,
  p1ExtensionsRemaining: 1,
  p2ExtensionsRemaining: 1,
  p1Fouls: 0,
  p2Fouls: 0,
  isExtensionActive: false,
  isFirstShotOfInning: true,
  winner: null,
  pendingSafetyIndex: null,
};

export const useMatchEngine = () => {
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.phase !== GamePhase.AIMING || !settings.audioEnabled || state.isPaused || state.isBreakPrep) return;
    if (state.timeLeft === 30) speak("Thirty seconds");
    if (state.timeLeft === 10) {
        speak("Ten seconds");
        playBeep(600, 100);
    }
    if (state.timeLeft <= 5 && state.timeLeft > 0) playBeep(800, 150);
    if (state.timeLeft === 0) {
        playBeep(200, 500);
        speak("Time violation");
    }
  }, [state.timeLeft, state.phase, settings.audioEnabled, state.isPaused, state.isBreakPrep]);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== GamePhase.AIMING || prev.isPaused || prev.isBreakPrep) return prev;
      return { ...prev, timeLeft: prev.timeLeft - 1 };
    });
  }, []);

  useEffect(() => {
    if (state.phase === GamePhase.AIMING && !state.isPaused && !state.isBreakPrep) {
      timerRef.current = window.setInterval(tick, 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.phase, state.isPaused, state.isBreakPrep, tick]);

  const startGame = (p1: string, p2: string) => {
    const playersChanged = (p1 !== state.p1Name || p2 !== state.p2Name);
    
    setState(prev => ({
      ...INITIAL_STATE,
      phase: GamePhase.AIMING,
      isBreakPrep: true,
      currentPlayer: settings.breakingPlayer,
      p1Name: p1 || 'Player 1',
      p2Name: p2 || 'Player 2',
      shotHistory: playersChanged ? [] : prev.shotHistory,
      p1ExtensionsRemaining: settings.extensionsAllowed,
      p2ExtensionsRemaining: settings.extensionsAllowed,
      timeLeft: settings.shotTime,
      totalTimeForShot: settings.shotTime,
    }));
    if (settings.audioEnabled) playBeep(1000, 50);
  };

  const updateSessionSettings = (newSettings: GameSettings, p1Name?: string, p2Name?: string) => {
    const playersChanged = (p1Name !== state.p1Name || p2Name !== state.p2Name);
    
    setSettings(newSettings);
    setState(prev => {
        let matchWinner: PlayerId | null = null;
        if (newSettings.format === MatchFormat.RACE) {
            if (prev.p1Score >= newSettings.target) matchWinner = PlayerId.ONE;
            else if (prev.p2Score >= newSettings.target) matchWinner = PlayerId.TWO;
        } else if (newSettings.format === MatchFormat.SET) {
            if (prev.currentRack > newSettings.target) {
                matchWinner = prev.p1Score > prev.p2Score ? PlayerId.ONE : (prev.p2Score > prev.p1Score ? PlayerId.TWO : null);
            }
        }

        return {
            ...prev,
            p1Name: p1Name || prev.p1Name,
            p2Name: p2Name || prev.p2Name,
            shotHistory: playersChanged ? [] : prev.shotHistory,
            winner: matchWinner,
            phase: matchWinner ? GamePhase.MATCH_OVER : (prev.phase === GamePhase.SETUP ? GamePhase.SETUP : prev.phase)
        };
    });
  };

  const nextRack = (breakerId: PlayerId) => {
    setState(prev => ({
      ...prev,
      phase: GamePhase.AIMING,
      isBreakPrep: true,
      isFirstShotAfterBreak: false,
      currentPlayer: breakerId,
      currentRack: prev.currentRack + 1,
      p1ExtensionsRemaining: settings.extensionsAllowed,
      p2ExtensionsRemaining: settings.extensionsAllowed,
      p1Fouls: 0,
      p2Fouls: 0,
      timeLeft: settings.shotTime,
      totalTimeForShot: settings.shotTime,
      isFirstShotOfInning: true,
      isExtensionActive: false,
      winner: null,
    }));
  };

  const togglePause = () => setState(prev => ({ ...prev, isPaused: !prev.isPaused }));

  const handleShotStruck = () => {
    if (state.phase !== GamePhase.AIMING) return;
    setState((prev) => ({ ...prev, phase: GamePhase.ASSESSING }));
  };

  const useExtension = () => {
    if (state.phase !== GamePhase.AIMING || state.isExtensionActive || state.isPaused || state.isBreakPrep) return;
    const isP1 = state.currentPlayer === PlayerId.ONE;
    const remaining = isP1 ? state.p1ExtensionsRemaining : state.p2ExtensionsRemaining;

    if (remaining > 0) {
      if (settings.audioEnabled) speak("Extension");
      setState((prev) => ({
        ...prev,
        timeLeft: prev.timeLeft + settings.extensionTime,
        totalTimeForShot: prev.totalTimeForShot + settings.extensionTime,
        p1ExtensionsRemaining: isP1 ? prev.p1ExtensionsRemaining - 1 : prev.p1ExtensionsRemaining,
        p2ExtensionsRemaining: !isP1 ? prev.p2ExtensionsRemaining - 1 : prev.p2ExtensionsRemaining,
        isExtensionActive: true,
      }));
    }
  };

  const handleOutcome = (outcome: ShotOutcome) => {
    const timeUsed = state.isBreakPrep ? 0 : (state.totalTimeForShot - state.timeLeft);
    const history = [...state.shotHistory];
    
    if (state.pendingSafetyIndex !== null) {
      const safetyShot = history[state.pendingSafetyIndex];
      let result: SafetyResult = 'NEUTRAL';
      if (outcome === ShotOutcome.MADE || outcome === ShotOutcome.BREAK_LEGAL) result = 'UNSUCCESSFUL';
      else if (outcome === ShotOutcome.FOUL || outcome === ShotOutcome.BREAK_FOUL || outcome === ShotOutcome.TIME_FOUL) result = 'SUCCESSFUL';
      history[state.pendingSafetyIndex] = { ...safetyShot, safetyResult: result };
    }

    const newEvent: ShotEvent = {
      id: Date.now().toString(),
      playerId: state.currentPlayer,
      outcome,
      timestamp: Date.now(),
      timeUsed,
      isExtensionUsed: state.isExtensionActive,
      safetyResult: outcome === ShotOutcome.SAFETY ? 'PENDING' : undefined,
      rackNumber: state.currentRack,
    };

    let nextPlayer = state.currentPlayer;
    let isNextShotFirstOfInning = false;
    let rackWinner: PlayerId | null = null;
    let matchWinner: PlayerId | null = null;
    let newP1Fouls = state.p1Fouls;
    let newP2Fouls = state.p2Fouls;

    if (outcome === ShotOutcome.WIN) {
        rackWinner = state.currentPlayer;
    } else if (outcome === ShotOutcome.EARLY_8_LOSS) {
        rackWinner = state.currentPlayer === PlayerId.ONE ? PlayerId.TWO : PlayerId.ONE;
    }

    const isFoul = outcome === ShotOutcome.FOUL || outcome === ShotOutcome.TIME_FOUL || outcome === ShotOutcome.BREAK_FOUL;
    if (isFoul) {
        if (state.currentPlayer === PlayerId.ONE) newP1Fouls++; else newP2Fouls++;
        if (settings.threeFoulRule) {
            if (newP1Fouls >= 3) { rackWinner = PlayerId.TWO; outcome = ShotOutcome.THREE_FOUL_LOSS; }
            if (newP2Fouls >= 3) { rackWinner = PlayerId.ONE; outcome = ShotOutcome.THREE_FOUL_LOSS; }
        }
    } else if (outcome === ShotOutcome.MADE || outcome === ShotOutcome.BREAK_LEGAL) {
        if (state.currentPlayer === PlayerId.ONE) newP1Fouls = 0; else newP2Fouls = 0;
    }

    switch (outcome) {
      case ShotOutcome.MADE:
      case ShotOutcome.BREAK_LEGAL:
        isNextShotFirstOfInning = false;
        break;
      case ShotOutcome.MISSED:
      case ShotOutcome.SAFETY:
      case ShotOutcome.FOUL:
      case ShotOutcome.TIME_FOUL:
      case ShotOutcome.BREAK_DRY:
      case ShotOutcome.BREAK_FOUL:
      case ShotOutcome.PUSH_OUT:
        nextPlayer = state.currentPlayer === PlayerId.ONE ? PlayerId.TWO : PlayerId.ONE;
        isNextShotFirstOfInning = true;
        break;
    }

    const isPush = outcome === ShotOutcome.PUSH_OUT;
    const applyBonus = state.isBreakPrep; 
    const nextTimeLimit = settings.shotTime + (applyBonus ? settings.firstShotBonus : 0);
    const newHistory = [...history, newEvent];

    const newP1Score = state.p1Score + (rackWinner === PlayerId.ONE ? 1 : 0);
    const newP2Score = state.p2Score + (rackWinner === PlayerId.TWO ? 1 : 0);

    if (rackWinner && settings.format !== MatchFormat.SINGLE) {
        if (settings.format === MatchFormat.RACE && (newP1Score >= settings.target || newP2Score >= settings.target)) {
            matchWinner = rackWinner;
        } else if (settings.format === MatchFormat.SET && (state.currentRack >= settings.target)) {
            matchWinner = newP1Score > newP2Score ? PlayerId.ONE : (newP2Score > newP1Score ? PlayerId.TWO : null);
        }
    }

    setState((prev) => ({
      ...prev,
      shotHistory: newHistory,
      currentPlayer: nextPlayer,
      p1Score: newP1Score,
      p2Score: newP2Score,
      p1Fouls: newP1Fouls,
      p2Fouls: newP2Fouls,
      phase: matchWinner ? GamePhase.MATCH_OVER : (rackWinner ? GamePhase.RACK_OVER : (isPush ? GamePhase.PUSH_DECISION : GamePhase.AIMING)),
      isFirstShotOfInning: isNextShotFirstOfInning,
      isFirstShotAfterBreak: prev.isBreakPrep && !isFoul,
      isBreakPrep: false,
      winner: matchWinner,
      timeLeft: nextTimeLimit,
      totalTimeForShot: nextTimeLimit,
      isExtensionActive: false,
      pendingSafetyIndex: outcome === ShotOutcome.SAFETY ? newHistory.length - 1 : null,
      isPaused: false,
    }));

    if (!rackWinner && !matchWinner && !isPush && settings.audioEnabled) {
      setTimeout(() => playBeep(1000, 50), 50);
    }
  };

  const handlePushDecision = (accept: boolean) => {
    setState(prev => ({
        ...prev,
        phase: GamePhase.AIMING,
        currentPlayer: accept ? prev.currentPlayer : (prev.currentPlayer === PlayerId.ONE ? PlayerId.TWO : PlayerId.ONE),
        isFirstShotAfterBreak: false,
        timeLeft: settings.shotTime,
        totalTimeForShot: settings.shotTime,
    }));
    if (settings.audioEnabled) playBeep(1000, 50);
  };

  const handleTimeFoul = () => handleOutcome(ShotOutcome.TIME_FOUL);

  const undoLastOutcome = () => {
    if (state.shotHistory.length === 0) return;
    setState((prev) => {
        const history = [...prev.shotHistory];
        const lastShot = history.pop();
        if (!lastShot) return prev;
        const restoredPlayer = lastShot.playerId;
        const wasBreak = history.filter(s => s.rackNumber === prev.currentRack).length === 0;

        let p1Ext = prev.p1ExtensionsRemaining;
        let p2Ext = prev.p2ExtensionsRemaining;
        if (lastShot.isExtensionUsed) {
            if (restoredPlayer === PlayerId.ONE) p1Ext++; else p2Ext++;
        }

        let s1 = prev.p1Score;
        let s2 = prev.p2Score;
        if (lastShot.outcome === ShotOutcome.WIN || lastShot.outcome === ShotOutcome.EARLY_8_LOSS || lastShot.outcome === ShotOutcome.THREE_FOUL_LOSS) {
            const winner = lastShot.outcome === ShotOutcome.WIN ? restoredPlayer : (restoredPlayer === PlayerId.ONE ? PlayerId.TWO : PlayerId.ONE);
            if (winner === PlayerId.ONE) s1--; else s2--;
        }

        return {
            ...prev,
            shotHistory: history,
            currentPlayer: restoredPlayer,
            phase: GamePhase.ASSESSING,
            p1ExtensionsRemaining: p1Ext,
            p2ExtensionsRemaining: p2Ext,
            p1Score: s1,
            p2Score: s2,
            isBreakPrep: wasBreak,
            isFirstShotAfterBreak: wasBreak,
            pendingSafetyIndex: null,
            isPaused: false,
            winner: null,
        };
    });
  };

  const resetGame = useCallback(() => {
    setSettings(INITIAL_SETTINGS);
    setState({ ...INITIAL_STATE, shotHistory: [] });
  }, []);

  return { state, settings, setSettings, startGame, nextRack, togglePause, handleShotStruck, useExtension, handleOutcome, handleTimeFoul, undoLastOutcome, resetGame, handlePushDecision, updateSessionSettings };
};