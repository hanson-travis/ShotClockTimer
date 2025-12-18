import React from 'react';
import { GameSettings, PlayerId, MatchFormat, GameType } from '../types';
import { Settings, X, Timer, Target, Zap, RotateCcw, Home, PlayCircle } from 'lucide-react';

interface SetupModalProps {
  settings: GameSettings;
  setSettings: (s: GameSettings) => void;
  p1Name: string;
  setP1Name: (n: string) => void;
  p2Name: string;
  setP2Name: (n: string) => void;
  onStart: () => void;
  onUpdate: () => void;
  onReset: () => void;
  isMatchActive: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ 
  settings, setSettings, p1Name, setP1Name, p2Name, setP2Name, onStart, onUpdate, onReset, isMatchActive, isOpen, onClose 
}) => {
  if (!isOpen) return null;

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-indigo-400">
            <Settings size={24} />
            <h2 className="text-xl font-bold text-white">{isMatchActive ? 'Session Settings' : 'Match Setup'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors" title="Close"><X /></button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Game Type & Format */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Target size={14}/> Game Type & Format</div>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSettings({...settings, gameType: GameType.EIGHT_BALL})}
                    className={`py-3 rounded-lg border font-bold text-xs transition-all ${settings.gameType === GameType.EIGHT_BALL ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    8-BALL
                </button>
                <button onClick={() => setSettings({...settings, gameType: GameType.ROTATION})}
                    className={`py-3 rounded-lg border font-bold text-xs transition-all ${settings.gameType === GameType.ROTATION ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                    ROTATION (9/10B)
                </button>
             </div>
             <div className="grid grid-cols-3 gap-2">
                {Object.values(MatchFormat).map(f => (
                    <button key={f} onClick={() => setSettings({...settings, format: f, target: f === MatchFormat.SINGLE ? 1 : 5})}
                        className={`py-3 rounded-lg border font-bold text-xs transition-all ${settings.format === f ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                        {f}
                    </button>
                ))}
             </div>
             {settings.format !== MatchFormat.SINGLE && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between text-sm mb-3 text-slate-300">
                        <span className="font-medium">{settings.format === MatchFormat.RACE ? 'Race to' : 'Set of'} Racks</span>
                        <span className="font-bold text-indigo-400 text-lg">{settings.target}</span>
                    </div>
                    <input type="range" min="2" max="25" step="1" value={settings.target} onChange={(e) => setSettings({...settings, target: parseInt(e.target.value)})}
                        className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                </div>
             )}
          </div>

          {/* Rules Toggles */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Zap size={14}/> Additional Rules</div>
             <button 
                onClick={() => setSettings({...settings, threeFoulRule: !settings.threeFoulRule})}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${settings.threeFoulRule ? 'bg-orange-900/20 border-orange-500/50 text-orange-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}
             >
                <span className="text-sm font-bold">Three Foul Loss Option</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.threeFoulRule ? 'bg-orange-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.threeFoulRule ? 'left-6' : 'left-1'}`} />
                </div>
             </button>
          </div>

          {/* Players */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-blue-400 uppercase tracking-tight">Player 1</label>
                <input type="text" value={p1Name} onChange={(e) => setP1Name(e.target.value)} onFocus={handleFocus}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-all"/>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-orange-400 uppercase tracking-tight">Player 2</label>
                <input type="text" value={p2Name} onChange={(e) => setP2Name(e.target.value)} onFocus={handleFocus}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none transition-all"/>
              </div>
          </div>

          {/* Break Selection - Only show if not mid-match */}
          {!isMatchActive && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initial Break</h3>
                <div className="flex gap-2">
                    <button onClick={() => setSettings({...settings, breakingPlayer: PlayerId.ONE})}
                    className={`flex-1 py-3 rounded-lg border transition-all text-sm font-bold ${settings.breakingPlayer === PlayerId.ONE ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                        {p1Name || 'P1'}
                    </button>
                    <button onClick={() => setSettings({...settings, breakingPlayer: PlayerId.TWO})}
                    className={`flex-1 py-3 rounded-lg border transition-all text-sm font-bold ${settings.breakingPlayer === PlayerId.TWO ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                        {p2Name || 'P2'}
                    </button>
                </div>
              </div>
          )}

          {/* Clock Configuration Sliders */}
          <div className="space-y-6 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2"><Timer size={14}/> Timing Rules</div>
              <div className="space-y-4">
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Shot Limit</span>
                          <span className="text-indigo-400 font-bold">{settings.shotTime}s</span>
                      </div>
                      <input type="range" min="15" max="120" step="5" value={settings.shotTime} onChange={(e) => setSettings({...settings, shotTime: parseInt(e.target.value)})}
                          className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Extension Time</span>
                          <span className="text-indigo-400 font-bold">{settings.extensionTime}s</span>
                      </div>
                      <input type="range" min="15" max="60" step="5" value={settings.extensionTime} onChange={(e) => setSettings({...settings, extensionTime: parseInt(e.target.value)})}
                          className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Extensions per Rack</span>
                          <span className="text-indigo-400 font-bold">{settings.extensionsAllowed}</span>
                      </div>
                      <input type="range" min="0" max="3" step="1" value={settings.extensionsAllowed} onChange={(e) => setSettings({...settings, extensionsAllowed: parseInt(e.target.value)})}
                          className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Post-Break Bonus</span>
                          <span className="text-indigo-400 font-bold">{settings.firstShotBonus}s</span>
                      </div>
                      <input type="range" min="0" max="60" step="5" value={settings.firstShotBonus} onChange={(e) => setSettings({...settings, firstShotBonus: parseInt(e.target.value)})}
                          className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"/>
                  </div>
              </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10 flex flex-col gap-2">
          {isMatchActive ? (
              <>
                  <button onClick={onUpdate} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl text-lg transition-all shadow-xl active:scale-[0.98]">
                    APPLY CHANGES
                  </button>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                      <button onClick={onStart} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all">
                        <RotateCcw size={14} /> New Match (Reset Score)
                      </button>
                      <button onClick={onReset} className="bg-slate-800 hover:bg-red-900/20 text-slate-500 hover:text-red-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all">
                        <Home size={14} /> Exit to Main Menu
                      </button>
                  </div>
              </>
          ) : (
              <button onClick={onStart} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl text-lg transition-all shadow-xl active:scale-[0.98]">
                INITIALIZE SESSION
              </button>
          )}
        </div>
      </div>
    </div>
  );
};