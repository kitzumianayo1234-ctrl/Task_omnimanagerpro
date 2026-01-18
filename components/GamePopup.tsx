import React, { useState, useEffect, useRef } from 'react';
import { BrainGame } from '../types';
import { X, Play, Clock, CheckCircle2, Eye, EyeOff, XCircle, Trophy, Activity, Brain, Zap, Hash, Move } from 'lucide-react';

interface GamePopupProps {
  game: BrainGame;
  onClose: (result: { completed: boolean; score: number }) => void;
}

export const GamePopup: React.FC<GamePopupProps> = ({ game, onClose }) => {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(game.durationSeconds);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error' | 'timeout'>('none');
  const [finalScore, setFinalScore] = useState(0);
  
  // Game State Hooks
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathProblem, setMathProblem] = useState({ q: '12 + 15', a: 27 });
  
  const [reflexScore, setReflexScore] = useState(0);
  const [reflexPosition, setReflexPosition] = useState({ top: '50%', left: '50%' });

  const [memorySequence, setMemorySequence] = useState('');
  const [memoryInput, setMemoryInput] = useState('');
  const [isMemoryShowing, setIsMemoryShowing] = useState(false);

  const [puzzleWord, setPuzzleWord] = useState({ original: '', scrambled: '' });
  const [puzzleInput, setPuzzleInput] = useState('');

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'start' | 'success' | 'error' | 'click' = 'start') => {
    try {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const now = ctx.currentTime;

        if (type === 'start') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, now);
            oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            oscillator.start(now);
            oscillator.stop(now + 0.5);
        } else if (type === 'success') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, now);
            oscillator.frequency.setValueAtTime(659.25, now + 0.1);
            oscillator.frequency.setValueAtTime(783.99, now + 0.2);
            oscillator.frequency.setValueAtTime(1046.50, now + 0.3);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
            oscillator.start(now);
            oscillator.stop(now + 0.6);
        } else if (type === 'error') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, now);
            oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        } else if (type === 'click') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        }
    } catch (e) {
        // Audio might fail in some contexts, ignore
    }
  };

  // Init Games
  useEffect(() => {
    // Initialize Specific Game Logic
    if (game.type === 'MATH') {
       const a = Math.floor(Math.random() * 50) + 10;
       const b = Math.floor(Math.random() * 50) + 10;
       setMathProblem({ q: `${a} + ${b}`, a: a + b });
    }

    if (game.type === 'MEMORY') {
       const seq = Math.floor(100000 + Math.random() * 900000).toString();
       setMemorySequence(seq);
       setIsMemoryShowing(true);
    }

    if (game.type === 'PUZZLE') {
       const words = ['FOCUS', 'TASK', 'GOAL', 'TIME', 'PLAN', 'WORK', 'MIND', 'FAST', 'DONE', 'IDEA', 'SUCCESS', 'POWER'];
       const original = words[Math.floor(Math.random() * words.length)];
       const scrambled = original.split('').sort(() => 0.5 - Math.random()).join('');
       setPuzzleWord({ original, scrambled });
    }

    return () => {
        if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [game.type]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (started && timeLeft > 0 && feedback === 'none') {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        
        // Random move for reflex
        if (game.type === 'REFLEX') {
            setReflexPosition({
                top: `${Math.random() * 70 + 15}%`,
                left: `${Math.random() * 70 + 15}%`
            });
        }
      }, 1000);
    } else if (started && timeLeft === 0 && feedback === 'none') {
        // Auto complete for Exercise/Breathing
        if (game.type === 'EXERCISE' || game.type === 'BREATHING') {
            handleWin(50);
        } else {
            handleTimeout();
        }
    }
    return () => clearInterval(interval);
  }, [started, timeLeft, game.type, feedback]);

  // Memory Game Timer for Hiding Code
  useEffect(() => {
      if (started && game.type === 'MEMORY' && isMemoryShowing) {
          const timeout = setTimeout(() => {
              setIsMemoryShowing(false);
          }, 3000); // Show for 3 seconds
          return () => clearTimeout(timeout);
      }
  }, [started, game.type, isMemoryShowing]);


  const handleStart = () => {
      playSound('start');
      setStarted(true);
  };

  const calculateScore = (basePoints: number, timeMultiplier: number) => {
      return basePoints + (timeLeft * timeMultiplier);
  };

  const handleWin = (score: number) => {
      setFinalScore(score);
      setFeedback('success');
      playSound('success');
      setTimeout(() => onClose({ completed: true, score }), 2500);
  };

  const handleFail = () => {
      setFeedback('error');
      playSound('error');
      setTimeout(() => setFeedback('none'), 500); // Clear error shake after 500ms
  };

  const handleTimeout = () => {
      setFeedback('timeout');
      playSound('error');
      setTimeout(() => onClose({ completed: false, score: 0 }), 2500);
  };

  const checkMath = (e: React.FormEvent) => {
      e.preventDefault();
      if (parseInt(mathAnswer) === mathProblem.a) {
          const score = calculateScore(100, 10);
          handleWin(score);
      } else {
          handleFail();
          setMathAnswer('');
      }
  };

  const checkMemory = (e: React.FormEvent) => {
      e.preventDefault();
      if (memoryInput === memorySequence) {
          const score = calculateScore(200, 15);
          handleWin(score);
      } else {
          handleFail();
          setMemoryInput('');
      }
  }

  const checkPuzzle = (e: React.FormEvent) => {
      e.preventDefault();
      if (puzzleInput.toUpperCase() === puzzleWord.original) {
          const score = calculateScore(150, 10);
          handleWin(score);
      } else {
          handleFail();
          setPuzzleInput('');
      }
  }

  const handleReflexClick = () => {
      playSound('click');
      if (reflexScore + 1 >= 5) {
          const score = calculateScore(150, 20);
          handleWin(score);
      } else {
          setReflexScore(s => s + 1);
          setReflexPosition({
            top: `${Math.random() * 70 + 15}%`,
            left: `${Math.random() * 70 + 15}%`
          });
      }
  };

  const inputErrorClass = feedback === 'error' ? 'border-red-500 ring-2 ring-red-200 animate-shake' : 'border-pink-300 dark:border-pink-700 focus:ring-2 focus:ring-pink-500';

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300">
       <style>{`
         @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
         }
         .animate-shake { animation: shake 0.4s ease-in-out; }
         @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7); }
            70% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 20px rgba(236, 72, 153, 0); }
            100% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
         }
         .animate-pulse-ring { animation: pulse-ring 4s infinite cubic-bezier(0.4, 0, 0.6, 1); }
       `}</style>
       
       <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-700 dark:to-purple-800 p-6 flex justify-between items-center text-white shrink-0">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  {game.type === 'MATH' ? <Hash size={24}/> : 
                   game.type === 'REFLEX' ? <Move size={24}/> :
                   game.type === 'MEMORY' ? <Brain size={24}/> :
                   game.type === 'PUZZLE' ? <Activity size={24}/> :
                   <Zap size={24}/>}
               </div>
               <div>
                 <h2 className="font-bold text-xl leading-tight">{game.title}</h2>
                 <p className="text-pink-100 text-xs font-medium uppercase tracking-wide opacity-90">{game.type} Challenge</p>
               </div>
             </div>
             
             {started && feedback === 'none' && (
               <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg shadow-inner ${timeLeft < 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white'}`}>
                  <Clock size={18} /> {timeLeft}s
               </div>
             )}
             
             {!started && (
               <button onClick={() => onClose({completed: false, score: 0})} className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                 <X size={24} />
               </button>
             )}
          </div>

          {/* Game Body */}
          <div className="p-8 flex-1 flex flex-col items-center justify-center relative bg-slate-50 dark:bg-slate-950 min-h-[300px]">
             
             {/* Start Screen */}
             {!started ? (
               <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-24 h-24 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                     <Play size={48} fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Ready to recharge?</h3>
                  <p className="text-slate-600 dark:text-slate-300 max-w-xs mx-auto text-lg leading-relaxed">
                    {game.instructions}
                  </p>
                  <button 
                    onClick={handleStart}
                    className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-bold text-xl shadow-lg shadow-pink-500/30 hover:scale-105 transition-all active:scale-95"
                  >
                    Start Game
                  </button>
               </div>
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                  
                  {/* GAME: MATH */}
                  {game.type === 'MATH' && (
                    <div className="w-full text-center space-y-8">
                       <div className="text-6xl font-bold text-slate-800 dark:text-white font-mono tracking-wider">{mathProblem.q}</div>
                       <form onSubmit={checkMath} className="max-w-xs mx-auto relative">
                          <input 
                            autoFocus
                            type="number" 
                            value={mathAnswer} 
                            onChange={(e) => setMathAnswer(e.target.value)}
                            className={`w-full text-center text-4xl font-bold py-4 rounded-xl border-2 bg-white dark:bg-slate-900 dark:text-white outline-none transition-all shadow-sm ${inputErrorClass}`}
                            placeholder="?"
                          />
                          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 transition-colors">
                             <CheckCircle2 size={24} />
                          </button>
                       </form>
                    </div>
                  )}

                  {/* GAME: REFLEX */}
                  {game.type === 'REFLEX' && (
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-crosshair rounded-b-2xl">
                       <div className="absolute top-4 left-0 right-0 text-center text-sm font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
                          Catch the dot: {reflexScore} / 5
                       </div>
                       <button
                         onClick={handleReflexClick}
                         style={{ top: reflexPosition.top, left: reflexPosition.left, transition: 'top 0.4s ease-out, left 0.4s ease-out' }}
                         className="absolute w-16 h-16 bg-pink-500 dark:bg-pink-600 rounded-full shadow-lg shadow-pink-500/50 hover:scale-90 active:scale-75 transition-transform flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-10 group"
                       >
                          <div className="w-4 h-4 bg-white rounded-full group-hover:scale-150 transition-transform" />
                       </button>
                    </div>
                  )}

                  {/* GAME: MEMORY */}
                  {game.type === 'MEMORY' && (
                    <div className="text-center space-y-8">
                       {isMemoryShowing ? (
                         <div className="space-y-4 animate-in fade-in zoom-in">
                            <Eye size={48} className="mx-auto text-pink-500 mb-4 animate-pulse" />
                            <div className="text-6xl font-bold font-mono tracking-[0.5em] text-slate-800 dark:text-white">{memorySequence}</div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Memorize this number!</p>
                         </div>
                       ) : (
                         <form onSubmit={checkMemory} className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
                            <EyeOff size={48} className="mx-auto text-slate-400 mb-4" />
                            <input 
                              autoFocus
                              type="number"
                              value={memoryInput}
                              onChange={e => setMemoryInput(e.target.value)}
                              className={`w-full text-center text-4xl font-bold py-4 rounded-xl border-2 bg-white dark:bg-slate-900 dark:text-white outline-none tracking-[0.5em] shadow-sm ${inputErrorClass}`}
                              placeholder="######"
                            />
                            <button type="submit" className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md transition-transform active:scale-95">
                               Check Answer
                            </button>
                         </form>
                       )}
                    </div>
                  )}

                  {/* GAME: PUZZLE */}
                  {game.type === 'PUZZLE' && (
                    <div className="text-center space-y-8 w-full max-w-sm">
                       <div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Unscramble</p>
                          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 tracking-widest font-mono">
                             {puzzleWord.scrambled}
                          </div>
                       </div>
                       <form onSubmit={checkPuzzle} className="relative">
                          <input 
                            autoFocus
                            type="text" 
                            value={puzzleInput}
                            onChange={e => setPuzzleInput(e.target.value.toUpperCase())}
                            className={`w-full text-center text-3xl font-bold py-4 rounded-xl border-2 bg-white dark:bg-slate-900 dark:text-white outline-none uppercase tracking-widest shadow-sm ${inputErrorClass}`}
                            placeholder="ANSWER"
                          />
                          <div className="mt-4 flex justify-center">
                             <button type="submit" className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md transition-transform active:scale-95">
                               Solve
                             </button>
                          </div>
                       </form>
                    </div>
                  )}

                  {/* GAME: EXERCISE / BREATHING */}
                  {(game.type === 'EXERCISE' || game.type === 'BREATHING') && (
                    <div className="text-center space-y-8 relative z-10">
                       <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                          {game.type === 'BREATHING' ? (
                             <div className="absolute inset-0 bg-pink-200 dark:bg-pink-900/30 rounded-full animate-pulse-ring"></div>
                          ) : (
                             <div className="absolute inset-0 border-4 border-pink-200 dark:border-pink-900/50 rounded-full animate-spin [animation-duration:3s]"></div>
                          )}
                          <div className="relative z-10 text-6xl font-bold text-slate-800 dark:text-white font-mono">{timeLeft}</div>
                       </div>
                       <div>
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{game.title}</h3>
                          <p className="text-slate-600 dark:text-slate-300 text-lg">{game.instructions}</p>
                       </div>
                       <p className="text-sm text-slate-400 dark:text-slate-500 animate-pulse">Keep going, almost there!</p>
                    </div>
                  )}

               </div>
             )}

             {/* Feedback Overlay */}
             {feedback !== 'none' && (
                <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in zoom-in duration-300 ${
                   feedback === 'success' ? 'bg-green-500/10 dark:bg-green-500/20' : 'bg-red-500/10 dark:bg-red-500/20'
                }`}>
                   {feedback === 'success' && (
                      <>
                        <Trophy size={80} className="text-yellow-500 mb-4 drop-shadow-lg animate-bounce" />
                        <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Awesome!</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-xl font-medium">+{finalScore} Points</p>
                      </>
                   )}
                   {feedback === 'error' && (
                      <XCircle size={80} className="text-red-500 mb-4 drop-shadow-lg" />
                   )}
                   {feedback === 'timeout' && (
                      <>
                        <Clock size={80} className="text-orange-500 mb-4 drop-shadow-lg" />
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Time's Up!</h2>
                      </>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};