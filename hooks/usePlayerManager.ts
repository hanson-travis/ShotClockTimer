import { useState, useEffect, useCallback } from 'react';
import { KnownPlayer, SessionSummary, ShotEvent, PlayerId, ShotOutcome } from '../types';

const STORAGE_KEY = 'pool_tracker_known_players';
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export const usePlayerManager = () => {
  const [players, setPlayers] = useState<KnownPlayer[]>([]);

  // Load players on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as KnownPlayer[];
        // Prune history older than 3 months
        const now = Date.now();
        const pruned = parsed.map(player => ({
          ...player,
          history: player.history.filter(h => (now - h.date) < NINETY_DAYS_MS)
        }));
        setPlayers(pruned);
      } catch (e) {
        console.error("Failed to parse players", e);
      }
    }
  }, []);

  // Save players whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }, [players]);

  const addPlayer = useCallback((firstName: string, lastName: string, suffix?: string) => {
    const newPlayer: KnownPlayer = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      suffix,
      createdAt: Date.now(),
      lastPlayed: Date.now(),
      history: []
    };
    setPlayers(prev => [...prev, newPlayer]);
    return newPlayer;
  }, []);

  const deletePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }, []);

  const updatePlayerStats = useCallback((playerId: string, shots: ShotEvent[]) => {
    if (!playerId || shots.length === 0) return;

    const summary: SessionSummary = {
      date: Date.now(),
      shots: shots.length,
      made: shots.filter(s => 
        s.outcome === ShotOutcome.MADE || 
        s.outcome === ShotOutcome.BREAK_LEGAL || 
        s.outcome === ShotOutcome.WIN
      ).length,
      safeties: shots.filter(s => s.outcome === ShotOutcome.SAFETY).length,
      fouls: shots.filter(s => s.outcome === ShotOutcome.FOUL || s.outcome === ShotOutcome.BREAK_FOUL || s.outcome === ShotOutcome.TIME_FOUL).length,
      avgTime: shots.reduce((acc, s) => acc + s.timeUsed, 0) / shots.length
    };

    setPlayers(prev => prev.map(p => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        lastPlayed: Date.now(),
        history: [...p.history, summary]
      };
    }));
  }, []);

  const getPlayerDisplayName = (player: KnownPlayer) => {
    return `${player.firstName} ${player.lastName}${player.suffix ? ' ' + player.suffix : ''}`;
  };

  return { players, addPlayer, deletePlayer, updatePlayerStats, getPlayerDisplayName };
};