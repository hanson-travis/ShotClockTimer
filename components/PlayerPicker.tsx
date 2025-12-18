import React, { useState } from 'react';
import { KnownPlayer } from '../types';
import { X, UserPlus, Search, User, Trash2, ChevronRight } from 'lucide-react';

interface PlayerPickerProps {
  players: KnownPlayer[];
  onSelect: (player: KnownPlayer | null) => void;
  onAdd: (first: string, last: string, suffix: string) => KnownPlayer;
  onDelete: (id: string) => void;
  onClose: () => void;
  currentName: string;
}

export const PlayerPicker: React.FC<PlayerPickerProps> = ({ 
  players, onSelect, onAdd, onDelete, onClose, currentName 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ first: '', last: '', suffix: '' });

  const filtered = players.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first || !form.last) return;
    const newPlayer = onAdd(form.first, form.last, form.suffix);
    onSelect(newPlayer);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="text-indigo-400" size={20} />
            {isAdding ? 'New Player Profile' : 'Select Player'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isAdding ? (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                <input required autoFocus type="text" value={form.first} onChange={e => setForm({...form, first: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                <input required type="text" value={form.last} onChange={e => setForm({...form, last: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Suffix (Optional)</label>
                <input type="text" placeholder="Jr, Sr, III..." value={form.suffix} onChange={e => setForm({...form, suffix: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"/>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20">Create Profile</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 outline-none"/>
              </div>

              <button onClick={() => setIsAdding(true)} 
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                <UserPlus size={20} />
                <span className="font-bold">Add New Player Profile</span>
              </button>

              <div className="space-y-2">
                <button onClick={() => onSelect(null)} 
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">?</div>
                    <div>
                        <div className="font-bold text-slate-300">Unnamed Player</div>
                        <div className="text-[10px] text-slate-500 uppercase">Session-only stats</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </button>

                {filtered.map(p => (
                  <div key={p.id} className="group relative">
                    <button onClick={() => onSelect(p)} 
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-indigo-500/50 transition-all text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-900/40 text-indigo-400 flex items-center justify-center font-bold">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                            <div className="font-bold text-white">{p.firstName} {p.lastName} {p.suffix}</div>
                            <div className="text-[10px] text-slate-500 uppercase">
                                Last seen: {new Date(p.lastPlayed).toLocaleDateString()}
                            </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} 
                      className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {filtered.length === 0 && search && (
                  <div className="text-center py-8 text-slate-500 italic">No players found matching "{search}"</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};