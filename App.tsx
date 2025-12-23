import React, { useState, useEffect, useRef } from 'react';
import { useMatchEngine } from './hooks/useMatchEngine';
import { usePlayerManager } from './hooks/usePlayerManager';
import { GamePhase, PlayerId, ShotOutcome, MatchFormat, GameType } from './types';
import { RadialTimer } from './components/RadialTimer';
import { MatchStats } from './components/MatchStats';
import { SetupModal } from './components/SetupModal';
import { initializeAudio } from './utils/sound';
import { 
  Play, Pause, Activity, Settings, BarChart2, Undo2, RotateCcw, Timer as TimerIcon, History, ShieldCheck, ShieldX, ShieldAlert, AlertTriangle, ArrowRightLeft, Skull, Home, Trophy, Swords, PlayCircle, UserCircle
} from 'lucide-react';

const App: React.FC = () => {
  const { state, settings, setSettings, startGame, nextRack, togglePause, handleShotStruck, useExtension, handleOutcome, handleTimeFoul, undoLastOutcome, resetGame, handlePushDecision, updateSessionSettings } = useMatchEngine();
  const { players, addPlayer, deletePlayer, updatePlayerStats } = usePlayerManager();
  
  const [showStats, setShowStats] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  
  const [tempP1Name, setTempP1Name] = useState('Player 1');
  const [tempP1Id, setTempP1Id] = useState<string | null>(null);
  const [tempP2Name, setTempP2Name] = useState('Player 2');
  const [tempP2Id, setTempP2Id] = useState<string | null>(null);
  
  const historyEndRef = useRef<HTMLDivElement>(null);
  const isP1 = state.currentPlayer === PlayerId.ONE;
  
  useEffect(() => { historyEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [state.shotHistory.length]);

  // Audio Unlock for Mobile: Initialize AudioContext on first interaction
  useEffect(() => {
    const unlock = () => {
      initializeAudio();
      ['click', 'touchstart', 'keydown'].forEach(e => document.removeEventListener(e, unlock));
    };
    ['click', 'touchstart', 'keydown'].forEach(e => document.addEventListener(e, unlock));
    return () => ['click', 'touchstart', 'keydown'].forEach(e => document.removeEventListener(e, unlock));
  }, []);

  // Reactive Menu Trigger: When phase becomes SETUP, force show the setup modal
  useEffect(() => {
    if (state.phase === GamePhase.SETUP) {
        setTempP1Name(state.p1Name);
        setTempP1Id(state.p1ProfileId);
        setTempP2Name(state.p2Name);
        setTempP2Id(state.p2ProfileId);
        setShowSetup(true);
    }
  }, [state.phase]);

  const saveKnownPlayerStats = () => {
    if (state.p1ProfileId) updatePlayerStats(state.p1ProfileId, state.shotHistory.filter(s => s.playerId === PlayerId.ONE));
    if (state.p2ProfileId) updatePlayerStats(state.p2ProfileId, state.shotHistory.filter(s => s.playerId === PlayerId.TWO));
  };

  const handleExitToMainMenu = () => {
    if (window.confirm('Exit to main menu? All session progress and scores will be cleared.')) {
        saveKnownPlayerStats();
        resetGame();
        setShowSetup(true);
    }
  };

  const handleUpdateMatch = () => {
    // If players are changing, archive the old ones if they were known players
    const playersChanging = (tempP1Id !== state.p1ProfileId || tempP2Id !== state.p2ProfileId || tempP1Name !== state.p1Name || tempP2Name !== state.p2Name);
    if (playersChanging) {
        saveKnownPlayerStats();
    }
    updateSessionSettings(settings, tempP1Name, tempP2Name, tempP1Id, tempP2Id);
    setShowSetup(false);
  };

  const handleStartMatch = () => {
    // If we are starting fresh but a known player was active, save their data
    saveKnownPlayerStats();
    startGame(tempP1Name, tempP2Name, tempP1Id, tempP2Id);
    setShowSetup(false);
  };

  const getBackgroundColor = () => {
    if (state.isPaused) return 'bg-slate-950';
    if (state.phase === GamePhase.AIMING) {
      if (state.isBreakPrep) return 'bg-slate-900';
      if (state.timeLeft <= 0) return 'bg-red-950';
      if (state.timeLeft <= settings.warningTime) return 'bg-red-900/40';
      if (state.timeLeft <= state.totalTimeForShot / 2) return 'bg-yellow-900/20';
    }
    return 'bg-slate-900';
  };

  const SafetyIcon = ({ result }: { result?: string }) => {
    if (result === 'SUCCESSFUL') return <span title="Safety Success"><ShieldCheck size={14} className="text-green-400" /></span>;
    if (result === 'UNSUCCESSFUL') return <span title="Safety Failed"><ShieldX size={14} className="text-red-400" /></span>;
    if (result === 'NEUTRAL') return <span title="Safety Neutral"><ShieldAlert size={14} className="text-blue-400" /></span>;
    return null;
  };

  const isMatchStarted = state.phase !== GamePhase.SETUP;

  return (
    <div className={`h-screen flex flex-col transition-colors duration-500 text-slate-100 ${getBackgroundColor()}`}>
      
      {/* Header with Scoreboard */}
      <header className="h-14 sm:h-16 flex-none bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
            <Activity className="text-indigo-500" size={20} />
            <span className="font-bold hidden lg:block">Pool ShotClock <span className="text-indigo-500">Pro</span></span>
        </div>

        {/* Central Scoreboard */}
        <div className="flex flex-col items-center">
            <div className="flex items-center bg-slate-800 rounded-full px-4 py-1 border border-slate-700 shadow-inner">
                <span className="text-blue-400 font-bold px-2">{state.p1Score}</span>
                <div className="w-px h-4 bg-slate-600 mx-2"></div>
                <span className="text-xs text-slate-500 uppercase font-bold px-2">
                    {settings.format === MatchFormat.SINGLE ? `Game ${state.currentRack}` : `Rack ${state.currentRack}`}
                </span>
                <div className="w-px h-4 bg-slate-600 mx-2"></div>
                <span className="text-orange-400 font-bold px-2">{state.p2Score}</span>
            </div>
            {settings.format !== MatchFormat.SINGLE && (
                <div className="text-[9px] uppercase font-black tracking-widest text-slate-500 mt-0.5">
                    {settings.format === MatchFormat.RACE ? `Race to ${settings.target}` : `Set of ${settings.target}`}
                </div>
            )}
        </div>

        <div className="flex gap-2">
           {state.shotHistory.length > 0 && (
              <button onClick={undoLastOutcome} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-yellow-500 border border-slate-700" title="Undo Last Action">
                  <Undo2 size={18} />
              </button>
           )}
           <button onClick={() => setShowStats(true)} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="Match Statistics"><BarChart2 size={18} /></button>
           <button onClick={() => setShowSetup(true)} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="Match Settings"><Settings size={18} /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden relative">
            {state.isPaused && (
                <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur flex items-center justify-center">
                    <div className="text-center animate-pulse">
                        <Pause size={80} className="mx-auto mb-4 text-slate-400" />
                        <h2 className="text-4xl font-black uppercase text-slate-200">Timer Paused</h2>
                    </div>
                </div>
            )}

            {/* Player Info Bar */}
            <div className="flex justify-between gap-2 sm:gap-4 mb-2 sm:mb-4 h-20 shrink-0">
                <div className={`flex-1 rounded-lg p-2 border-2 flex flex-col justify-center transition-all ${isP1 ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-800/50 border-transparent opacity-60'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1">
                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">{isP1 ? '• Shooting' : 'Player 1'}</div>
                            {state.p1ProfileId && <UserCircle size={10} className="text-indigo-400" />}
                        </div>
                        {settings.threeFoulRule && (
                            <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <Skull key={i} size={10} className={i < state.p1Fouls ? 'text-red-500' : 'text-slate-700'} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-sm sm:text-lg font-bold truncate">{state.p1Name}</div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(settings.extensionsAllowed)].map((_, i) => (
                        <div key={i} className={`h-1.5 w-4 rounded-full ${i < state.p1ExtensionsRemaining ? 'bg-blue-500' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                </div>
                <div className={`flex-1 rounded-lg p-2 border-2 flex flex-col justify-center transition-all ${!isP1 ? 'bg-orange-900/30 border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-slate-800/50 border-transparent opacity-60'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1">
                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">{!isP1 ? '• Shooting' : 'Player 2'}</div>
                            {state.p2ProfileId && <UserCircle size={10} className="text-indigo-400" />}
                        </div>
                        {settings.threeFoulRule && (
                            <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <Skull key={i} size={10} className={i < state.p2Fouls ? 'text-red-500' : 'text-slate-700'} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-sm sm:text-lg font-bold truncate">{state.p2Name}</div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(settings.extensionsAllowed)].map((_, i) => (
                        <div key={i} className={`h-1.5 w-4 rounded-full ${i < state.p2ExtensionsRemaining ? 'bg-orange-500' : 'bg-slate-700'}`} />
                      ))}
                    </div>
                </div>
            </div>

            {/* Timer Central */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 py-4">
                {(state.phase === GamePhase.AIMING || state.phase === GamePhase.ASSESSING) ? (
                   <div className="scale-[0.8] sm:scale-100 md:scale-125 transition-transform">
                      {state.isBreakPrep ? (
                          <div className="flex flex-col items-center">
                              <div className="w-56 h-56 rounded-full border-8 border-slate-700 flex items-center justify-center">
                                  <span className="text-4xl font-black text-indigo-400 uppercase italic">Ready</span>
                              </div>
                              <span className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Break</span>
                          </div>
                      ) : (
                          <RadialTimer timeLeft={state.timeLeft} totalTime={state.totalTimeForShot} warningTime={settings.warningTime} />
                      )}
                   </div>
                ) : state.phase === GamePhase.PUSH_DECISION ? (
                    <div className="text-center max-w-md bg-slate-800/50 p-8 rounded-3xl border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
                        <ArrowRightLeft size={48} className="mx-auto mb-4 text-indigo-400 animate-pulse" />
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Push Out Played</h2>
                        <p className="text-slate-400 mb-8 font-medium">Opponent must choose to accept the position or pass it back to the shooter.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handlePushDecision(true)} className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-900/20">Accept & Shoot</button>
                            <button onClick={() => handlePushDecision(false)} className="bg-slate-700 hover:bg-slate-600 p-4 rounded-xl font-bold transition-all active:scale-95 border border-slate-600">Pass Back</button>
                        </div>
                    </div>
                ) : state.phase === GamePhase.MATCH_OVER ? (
                   <div className="text-center bg-slate-800/40 p-10 rounded-3xl border border-yellow-500/20 backdrop-blur">
                       <Trophy size={64} className="text-yellow-500 mx-auto mb-4" />
                       <div className="text-5xl font-black text-white mb-2 uppercase tracking-tighter">Match Complete</div>
                       <div className="text-xl text-slate-300 mb-8 font-bold uppercase">
                            {state.winner === PlayerId.ONE ? state.p1Name : state.p2Name} won the {settings.format === MatchFormat.RACE ? `race to ${settings.target}` : `set of ${settings.target}`}
                       </div>
                       <div className="flex flex-col gap-3 max-w-xs mx-auto">
                            <button onClick={() => { updateSessionSettings({...settings, format: MatchFormat.SINGLE}); }} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                                <Swords size={18} /> Continue as Single Games
                            </button>
                            <button onClick={() => setShowSetup(true)} className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl font-bold text-slate-300 border border-slate-600 active:scale-95 transition-all">
                                <Settings size={18} /> Modify Match Format
                            </button>
                            <button onClick={handleExitToMainMenu} className="mt-6 text-slate-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-colors">
                                <Home size={14} /> End Session & Quit
                            </button>
                       </div>
                   </div>
                ) : state.phase === GamePhase.RACK_OVER ? (
                    <div className="text-center w-full max-w-2xl px-4">
                        <div className="text-5xl font-black text-blue-400 mb-2 uppercase tracking-tighter">
                            {settings.format === MatchFormat.SINGLE ? 'Game Complete' : 'Rack Complete'}
                        </div>
                        
                        <div className="bg-slate-800/40 py-3 px-6 rounded-2xl border border-slate-700 inline-block mb-8">
                            {settings.format === MatchFormat.SINGLE ? (
                                <div className="text-slate-400 font-bold uppercase text-sm tracking-widest">
                                    Total Score: <span className="text-white">{state.p1Score} - {state.p2Score}</span>
                                </div>
                            ) : settings.format === MatchFormat.RACE ? (
                                <div className="text-slate-400 font-bold uppercase text-sm tracking-widest">
                                    Score: <span className="text-white">{state.p1Score} - {state.p2Score}</span> in a race to <span className="text-indigo-400">{settings.target}</span>
                                </div>
                            ) : (
                                <div className="text-slate-400 font-bold uppercase text-sm tracking-widest">
                                    Game <span className="text-white">{state.currentRack} of {settings.target}</span> complete
                                </div>
                            )}
                        </div>

                        <div className="text-slate-300 mb-6 font-black uppercase tracking-widest text-lg">Next Breaker?</div>
                        
                        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
                             <button onClick={() => nextRack(PlayerId.ONE)} className="bg-blue-600 hover:bg-blue-500 px-6 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex flex-col items-center">
                                <span className="text-[10px] uppercase opacity-70 mb-1 tracking-widest">Break {settings.format === MatchFormat.SINGLE ? 'Game' : 'Rack'} {state.currentRack + 1}</span>
                                <span className="truncate w-full">{state.p1Name}</span>
                             </button>
                             <button onClick={() => nextRack(PlayerId.TWO)} className="bg-orange-600 hover:bg-orange-500 px-6 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/20 active:scale-95 transition-all flex flex-col items-center">
                                <span className="text-[10px] uppercase opacity-70 mb-1 tracking-widest">Break {settings.format === MatchFormat.SINGLE ? 'Game' : 'Rack'} {state.currentRack + 1}</span>
                                <span className="truncate w-full">{state.p2Name}</span>
                             </button>
                        </div>

                        <div className="flex justify-center gap-10">
                            <button onClick={() => setShowSetup(true)} className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors flex items-center gap-1">
                                <Settings size={14} /> Match Settings
                            </button>
                            <button onClick={handleExitToMainMenu} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-red-400 transition-colors flex items-center gap-1">
                                <Home size={14} /> Main Menu
                            </button>
                        </div>
                    </div>
                ) : (
                   <div className="flex flex-col items-center justify-center h-full">
                       <PlayCircle size={64} className="text-slate-700 mb-4 animate-pulse" />
                       <div className="text-slate-500 italic font-medium uppercase tracking-widest text-sm">Initialize session to begin tracking</div>
                   </div>
                )}
            </div>
        </div>

        {/* Desktop History Log */}
        <aside className="hidden md:flex w-72 flex-none bg-slate-900 border-l border-slate-800 flex-col overflow-hidden">
            <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><History size={14}/> Session History</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {state.shotHistory.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-600 text-xs italic px-10 text-center">No shots recorded for current players</div>
                ) : state.shotHistory.map((s) => (
                    <div key={s.id} className="p-2 rounded bg-slate-800/50 border border-slate-700 text-xs flex flex-col gap-1 animate-in fade-in slide-in-from-right-2">
                        <div className="flex justify-between items-center">
                            <span className={`font-bold ${s.playerId === PlayerId.ONE ? 'text-blue-400' : 'text-orange-400'}`}>R{s.rackNumber} • {s.playerId === PlayerId.ONE ? state.p1Name : state.p2Name}</span>
                            <span className="text-slate-500">{s.timeUsed}s</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-slate-200 uppercase">
                            <span>{s.outcome.replace(/_/g,' ')}</span>
                            <SafetyIcon result={s.safetyResult} />
                        </div>
                    </div>
                ))}
            </div>
        </aside>
      </main>

      {/* Footer Controls */}
      <footer className="h-[25vh] sm:h-[30vh] flex-none bg-slate-800 border-t border-slate-700 p-2 sm:p-4 z-50 shadow-2xl">
          {state.phase === GamePhase.AIMING && (
              <div className="h-full grid grid-cols-[auto_1fr_auto] gap-2 sm:gap-4">
                  <button onClick={useExtension} disabled={state.isExtensionActive || state.isPaused || state.isBreakPrep} 
                    className={`w-16 sm:w-28 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${state.isExtensionActive || state.isBreakPrep ? 'bg-slate-900 text-slate-600 border-slate-800' : 'bg-slate-700 text-white border-slate-500 active:scale-95'}`}>
                      <TimerIcon size={24} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Extend</span>
                  </button>
                  <div className="flex flex-col gap-2">
                      <button onClick={handleShotStruck} disabled={state.isPaused}
                        className={`flex-1 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center ${state.isPaused ? 'bg-slate-700 opacity-50' : (state.isBreakPrep ? 'bg-indigo-600' : 'bg-blue-600')}`}>
                          <span className="text-2xl sm:text-4xl font-black italic uppercase text-white tracking-tighter">
                            {state.isBreakPrep ? 'BREAK STRUCK' : 'SHOT STRUCK'}
                          </span>
                      </button>
                      {!state.isBreakPrep && state.timeLeft <= 0 && !state.isPaused && (
                        <button onClick={handleTimeFoul} className="h-10 sm:h-12 bg-red-600 text-white font-black rounded-lg flex items-center justify-center gap-2 animate-pulse">
                            <AlertTriangle size={16} /> CALL TIME FOUL
                        </button>
                      )}
                  </div>
                  <button onClick={togglePause} disabled={state.isBreakPrep}
                    className={`w-16 sm:w-28 rounded-xl border-2 flex flex-col items-center justify-center transition-all border-slate-500 ${state.isBreakPrep ? 'bg-slate-900 border-slate-800 text-slate-700' : (state.isPaused ? 'bg-green-600 text-white border-green-400' : 'bg-slate-700 text-white active:scale-95')}`}>
                      {state.isPaused ? <Play size={24} className="mb-1" /> : <Pause size={24} className="mb-1" />}
                      <span className="text-[10px] font-bold uppercase">{state.isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
              </div>
          )}

          {state.phase === GamePhase.ASSESSING && (
              <div className="h-full flex flex-col gap-2">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      <button onClick={() => handleOutcome(state.isBreakPrep ? ShotOutcome.BREAK_LEGAL : ShotOutcome.MADE)} className="bg-green-600 text-white rounded-lg font-bold p-2 active:scale-95 transition-transform flex flex-col items-center justify-center">
                        <span className="text-xs sm:text-lg uppercase">{state.isBreakPrep ? 'LEGAL BREAK' : 'POTTED'}</span>
                      </button>
                      <button onClick={() => handleOutcome(state.isBreakPrep ? ShotOutcome.BREAK_DRY : ShotOutcome.MISSED)} className="bg-slate-600 text-white rounded-lg font-bold p-2 active:scale-95 transition-transform flex flex-col items-center justify-center">
                        <span className="text-xs sm:text-lg uppercase">{state.isBreakPrep ? 'DRY BREAK' : 'MISSED'}</span>
                      </button>
                      <button onClick={() => handleOutcome(ShotOutcome.SAFETY)} disabled={state.isBreakPrep} className="bg-blue-600 text-white rounded-lg font-bold p-2 active:scale-95 transition-transform disabled:opacity-30 flex flex-col items-center justify-center">
                        <span className="text-xs sm:text-lg uppercase">SAFETY</span>
                      </button>
                      <button onClick={() => handleOutcome(state.isBreakPrep ? ShotOutcome.BREAK_FOUL : ShotOutcome.FOUL)} className="bg-red-600 text-white rounded-lg font-bold p-2 active:scale-95 transition-transform flex flex-col items-center justify-center">
                        <span className="text-xs sm:text-lg uppercase">{state.isBreakPrep ? 'SCRATCH' : 'FOUL'}</span>
                      </button>
                      {settings.gameType === GameType.ROTATION && state.isFirstShotAfterBreak && (
                          <button onClick={() => handleOutcome(ShotOutcome.PUSH_OUT)} className="bg-indigo-700 text-white rounded-lg font-bold p-2 active:scale-95 transition-transform flex flex-col items-center justify-center shadow-lg border border-indigo-400 col-span-2 sm:col-span-1">
                            <span className="text-xs sm:text-lg uppercase">PUSH OUT</span>
                          </button>
                      )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-12">
                      <button onClick={() => handleOutcome(ShotOutcome.WIN)} className="bg-yellow-600 text-white rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 transition-transform border border-yellow-400 shadow-lg">BALL POTTED (WIN)</button>
                      <button onClick={() => handleOutcome(ShotOutcome.EARLY_8_LOSS)} className="bg-red-800 text-white rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-widest active:scale-95 transition-transform border border-red-500 shadow-lg">{settings.gameType === GameType.EIGHT_BALL ? 'EARLY 8 / LOSS' : 'LOSS OF RACK'}</button>
                  </div>
              </div>
          )}

          {(state.phase === GamePhase.SETUP || state.phase === GamePhase.MATCH_OVER) && (
              <div className="h-full flex items-center justify-center">
                  <button onClick={() => setShowSetup(true)} className="flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors">
                      <Settings size={48} />
                      <span className="font-bold uppercase tracking-widest">Setup Session</span>
                  </button>
              </div>
          )}
      </footer>

      {showStats && <MatchStats state={state} onClose={() => setShowStats(false)} />}
      <SetupModal 
        settings={settings} 
        setSettings={setSettings} 
        p1Name={tempP1Name} setP1Name={setTempP1Name} 
        p1Id={tempP1Id} setP1Id={setTempP1Id}
        p2Name={tempP2Name} setP2Name={setTempP2Name} 
        p2Id={tempP2Id} setP2Id={setTempP2Id}
        onStart={handleStartMatch} 
        onUpdate={handleUpdateMatch}
        onReset={handleExitToMainMenu}
        isMatchActive={isMatchStarted}
        isOpen={showSetup} 
        onClose={() => setShowSetup(false)} 
        knownPlayers={players}
        onAddKnownPlayer={addPlayer}
        onDeleteKnownPlayer={deletePlayer}
      />
    </div>
  );
};

export default App;