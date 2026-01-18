import React, { useState } from 'react';
import { BrainGame, GameScore, GameSettings, GameType } from '../types';
import { Gamepad2, Timer, Settings, Plus, Trash2, Edit2, PlayCircle, ToggleLeft, ToggleRight, Save, Zap, Brain, Puzzle, Calculator, Wind, MousePointer2, Trophy } from 'lucide-react';

interface GameDashboardProps {
  games: BrainGame[];
  setGames: React.Dispatch<React.SetStateAction<BrainGame[]>>;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  triggerGameNow: () => void;
  scores: GameScore[];
}

export const GameDashboard: React.FC<GameDashboardProps> = ({ games, setGames, settings, setSettings, triggerGameNow, scores }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editedGame, setEditedGame] = useState<Partial<BrainGame>>({});

  const handleToggleActive = (id: string) => {
    setGames(games.map(g => g.id === id ? { ...g, active: !g.active } : g));
  };

  const handleEdit = (game: BrainGame) => {
    setIsEditing(game.id);
    setEditedGame(game);
  };

  const handleSave = () => {
    if (isEditing && editedGame) {
      setGames(games.map(g => g.id === isEditing ? { ...g, ...editedGame } as BrainGame : g));
      setIsEditing(null);
    }
  };

  const handleAddNew = () => {
    const newGame: BrainGame = {
      id: crypto.randomUUID(),
      title: 'New Activity',
      type: 'EXERCISE',
      durationSeconds: 60,
      instructions: 'Do jumping jacks.',
      active: true,
      frequency: 'RANDOM'
    };
    setGames([...games, newGame]);
    handleEdit(newGame);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this activity?')) {
      setGames(games.filter(g => g.id !== id));
    }
  };

  const topScores = [...scores].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-700 dark:to-purple-800 rounded-2xl p-8 text-white shadow-lg dark:shadow-purple-900/30 relative overflow-hidden group">
         <div className="absolute right-0 top-0 opacity-10 p-4 transition-transform group-hover:scale-110 duration-700">
            <Gamepad2 size={150} />
         </div>
         <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2 tracking-tight">Game Changer</h1>
           <p className="text-pink-100 max-w-xl text-lg">
             Boost your brain power and physical health with sudden, fun pop-up exercises and mind games. 
             Unexpected interruptions to keep you sharp!
           </p>
           <button 
             onClick={triggerGameNow}
             className="mt-6 bg-white text-pink-600 px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-pink-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
           >
             <Zap size={18} fill="currentColor" /> Test Trigger Now
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Scores & Settings */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Leaderboard */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
               <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                   <Trophy size={20} className="text-yellow-500" />
                   High Scores
               </h3>
               {topScores.length === 0 ? (
                   <div className="text-center text-slate-400 dark:text-slate-500 text-xs py-4">No games played yet.</div>
               ) : (
                   <div className="space-y-3">
                       {topScores.map((score, idx) => (
                           <div key={score.id} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                               <div className="flex items-center gap-2">
                                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                                       {idx + 1}
                                   </div>
                                   <div className="text-xs">
                                       <div className="font-bold text-slate-700 dark:text-slate-200">{score.gameTitle}</div>
                                       <div className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(score.date).toLocaleDateString()}</div>
                                   </div>
                               </div>
                               <div className="font-mono font-bold text-pink-600 dark:text-pink-400">{score.score}</div>
                           </div>
                       ))}
                   </div>
               )}
           </div>

           {/* Settings Panel */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
             <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
               <Settings size={20} className="text-slate-400" />
               Configuration
             </h2>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Pop-ups</span>
                   <button 
                     onClick={() => setSettings({...settings, enabled: !settings.enabled})}
                     className={`transition-colors ${settings.enabled ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}`}
                   >
                     {settings.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                   </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Frequency (Games/Day)</label>
                  <input 
                    type="range" 
                    min="1" max="5" 
                    value={settings.gamesPerDay}
                    onChange={(e) => setSettings({...settings, gamesPerDay: Number(e.target.value)})}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1</span>
                    <span className="font-bold text-pink-600 dark:text-pink-400">{settings.gamesPerDay}</span>
                    <span>5</span>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Random Window (Minutes)</label>
                   <div className="flex gap-2 items-center">
                      <input 
                        type="number" 
                        value={settings.minIntervalMinutes}
                        onChange={(e) => setSettings({...settings, minIntervalMinutes: Number(e.target.value)})}
                        className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded text-sm outline-none focus:border-pink-500"
                      />
                      <span className="text-slate-400">-</span>
                      <input 
                        type="number" 
                        value={settings.maxIntervalMinutes}
                        onChange={(e) => setSettings({...settings, maxIntervalMinutes: Number(e.target.value)})}
                        className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded text-sm outline-none focus:border-pink-500"
                      />
                   </div>
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Games will appear randomly within this time range after the last game.</p>
                </div>
             </div>
           </div>
        </div>

        {/* Games List (Right Column) */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex justify-between items-center">
              <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PlayCircle size={20} className="text-slate-400" />
                Your Activities
              </h2>
              <button 
                onClick={handleAddNew}
                className="text-sm bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
              >
                <Plus size={16} /> New Activity
              </button>
           </div>

           {games.map(game => (
             <div key={game.id} className={`p-5 rounded-xl border transition-all ${game.active ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-900 opacity-60'}`}>
               {isEditing === game.id ? (
                 <div className="space-y-3 animate-in fade-in">
                    <input 
                      type="text" 
                      value={editedGame.title}
                      onChange={(e) => setEditedGame({...editedGame, title: e.target.value})}
                      className="w-full font-bold text-lg border-b border-slate-300 dark:border-slate-700 focus:border-pink-500 outline-none pb-1 bg-transparent text-slate-800 dark:text-white"
                      placeholder="Title"
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">Type</label>
                          <select 
                            value={editedGame.type}
                            onChange={(e) => setEditedGame({...editedGame, type: e.target.value as GameType})}
                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded p-1 text-sm outline-none focus:ring-1 focus:ring-pink-500"
                          >
                             <option value="EXERCISE">Physical Exercise</option>
                             <option value="MATH">Math Challenge</option>
                             <option value="BREATHING">Breathing</option>
                             <option value="REFLEX">Reflex Test</option>
                             <option value="MEMORY">Memory Game</option>
                             <option value="PUZZLE">Puzzle / Scramble</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs text-slate-400 mb-1">Duration (Sec)</label>
                          <input 
                             type="number"
                             value={editedGame.durationSeconds}
                             onChange={(e) => setEditedGame({...editedGame, durationSeconds: Number(e.target.value)})}
                             className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded p-1 text-sm outline-none focus:ring-1 focus:ring-pink-500"
                          />
                       </div>
                    </div>
                    <textarea 
                       value={editedGame.instructions}
                       onChange={(e) => setEditedGame({...editedGame, instructions: e.target.value})}
                       className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-pink-500"
                       rows={2}
                       placeholder="Instructions..."
                    />
                    <div className="flex justify-end gap-2 mt-2">
                       <button onClick={() => setIsEditing(null)} className="px-3 py-1 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Cancel</button>
                       <button onClick={handleSave} className="px-3 py-1 text-sm bg-pink-600 hover:bg-pink-700 text-white rounded flex items-center gap-1 shadow-sm"><Save size={14}/> Save</button>
                    </div>
                 </div>
               ) : (
                 <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                       <div className={`p-3 rounded-lg shadow-sm ${
                         game.type === 'EXERCISE' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                         game.type === 'MATH' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                         game.type === 'BREATHING' ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' :
                         game.type === 'MEMORY' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                         game.type === 'PUZZLE' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                         'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                       }`}>
                          {game.type === 'EXERCISE' && <Zap size={24} />}
                          {game.type === 'MATH' && <Calculator size={24} />}
                          {game.type === 'BREATHING' && <Wind size={24} />}
                          {game.type === 'REFLEX' && <MousePointer2 size={24} />}
                          {game.type === 'MEMORY' && <Brain size={24} />}
                          {game.type === 'PUZZLE' && <Puzzle size={24} />}
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-800 dark:text-white text-lg">{game.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{game.instructions}</p>
                          <div className="flex items-center gap-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                             <span className="flex items-center gap-1"><Timer size={12}/> {game.durationSeconds}s</span>
                             <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{game.type}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleToggleActive(game.id)} className={`${game.active ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'} hover:scale-110 transition-transform`}>
                          {game.active ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                       </button>
                       <button onClick={() => handleEdit(game)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                          <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(game.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               )}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};