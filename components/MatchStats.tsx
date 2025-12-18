import React, { useMemo } from 'react';
import { PlayerId, ShotOutcome, GameState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { WhiskerPlot } from './WhiskerPlot';
import { X } from 'lucide-react';

interface MatchStatsProps {
  state: GameState;
  onClose: () => void;
}

export const MatchStats: React.FC<MatchStatsProps> = ({ state, onClose }) => {
  const getPlayerStats = (pid: PlayerId) => {
    const shots = state.shotHistory.filter(s => s.playerId === pid);
    const total = shots.length;
    const times = shots.map(s => s.timeUsed);
    
    const count = times.length;
    const min = count > 0 ? Math.min(...times) : 0;
    const max = count > 0 ? Math.max(...times) : 0;
    const sum = times.reduce((a, b) => a + b, 0);
    const mean = count > 0 ? sum / count : 0;
    const variance = count > 0 ? times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count : 0;
    const stdDev = Math.sqrt(variance);

    const made = shots.filter(s => s.outcome === ShotOutcome.MADE || s.outcome === ShotOutcome.BREAK_LEGAL).length;
    const safety = shots.filter(s => s.outcome === ShotOutcome.SAFETY).length;
    const foul = shots.filter(s => s.outcome === ShotOutcome.FOUL || s.outcome === ShotOutcome.BREAK_FOUL || s.outcome === ShotOutcome.TIME_FOUL).length;
    const miss = shots.filter(s => s.outcome === ShotOutcome.MISSED || s.outcome === ShotOutcome.BREAK_DRY).length;

    return { total, made, safety, foul, miss, whisker: { min, max, mean, stdDev, count } };
  };

  const p1Stats = useMemo(() => getPlayerStats(PlayerId.ONE), [state.shotHistory]);
  const p2Stats = useMemo(() => getPlayerStats(PlayerId.TWO), [state.shotHistory]);

  const COLORS = { MADE: '#22c55e', MISS: '#ef4444', SAFETY: '#3b82f6', FOUL: '#eab308' };

  return (
    <div className="fixed inset-0 bg-slate-950/95 z-[100] overflow-y-auto p-4 flex items-center justify-center">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl p-6 shadow-2xl border border-slate-700 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors border border-slate-600 shadow-lg"
          aria-label="Close Statistics"
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Session Analytics</h2>
          <p className="text-slate-400">Aggregated statistics across {state.currentRack} rack(s)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Shot Timing Distribution</h3>
            <WhiskerPlot label={state.p1Name} stats={p1Stats.whisker} color="#3b82f6" />
            <WhiskerPlot label={state.p2Name} stats={p2Stats.whisker} color="#f97316" />
            
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-8 mb-4">Shot Outcomes (Global)</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-blue-400 font-bold mb-1 text-center">{state.p1Name}</div>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[{name:'Pot',value:p1Stats.made},{name:'Miss',value:p1Stats.miss},{name:'Safe',value:p1Stats.safety},{name:'Foul',value:p1Stats.foul}].filter(d=>d.value>0)} 
                                    cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value">
                                    <Cell fill={COLORS.MADE} /><Cell fill={COLORS.MISS} /><Cell fill={COLORS.SAFETY} /><Cell fill={COLORS.FOUL} />
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', color: '#fff'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="text-orange-400 font-bold mb-1 text-center">{state.p2Name}</div>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[{name:'Pot',value:p2Stats.made},{name:'Miss',value:p2Stats.miss},{name:'Safe',value:p2Stats.safety},{name:'Foul',value:p2Stats.foul}].filter(d=>d.value>0)} 
                                    cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value">
                                    <Cell fill={COLORS.MADE} /><Cell fill={COLORS.MISS} /><Cell fill={COLORS.SAFETY} /><Cell fill={COLORS.FOUL} />
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor:'#0f172a', border:'none', color: '#fff'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Performance Matrix</h3>
            <div className="space-y-4 text-slate-100">
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Potting Accuracy</span>
                  <div className="flex gap-4">
                    <span className="text-blue-400 font-bold">{p1Stats.total > 0 ? Math.round((p1Stats.made / p1Stats.total) * 100) : 0}%</span>
                    <span className="text-orange-400 font-bold">{p2Stats.total > 0 ? Math.round((p2Stats.made / p2Stats.total) * 100) : 0}%</span>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Total Shots Taken</span>
                  <div className="flex gap-4">
                    <span className="text-blue-400 font-bold">{p1Stats.total}</span>
                    <span className="text-orange-400 font-bold">{p2Stats.total}</span>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Safety Success</span>
                  <div className="flex gap-4">
                    <span className="text-blue-400 font-bold">{p1Stats.safety > 0 ? Math.round((state.shotHistory.filter(s=>s.playerId===PlayerId.ONE && s.safetyResult==='SUCCESSFUL').length / p1Stats.safety)*100) : 0}%</span>
                    <span className="text-orange-400 font-bold">{p2Stats.safety > 0 ? Math.round((state.shotHistory.filter(s=>s.playerId===PlayerId.TWO && s.safetyResult==='SUCCESSFUL').length / p2Stats.safety)*100) : 0}%</span>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Time Violations</span>
                  <div className="flex gap-4">
                    <span className="text-blue-400 font-bold">{state.shotHistory.filter(s=>s.playerId===PlayerId.ONE && s.outcome===ShotOutcome.TIME_FOUL).length}</span>
                    <span className="text-orange-400 font-bold">{state.shotHistory.filter(s=>s.playerId===PlayerId.TWO && s.outcome===ShotOutcome.TIME_FOUL).length}</span>
                  </div>
                </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="mt-auto w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg border border-slate-600"
            >
              Return to Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};