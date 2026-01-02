import React, { useState, useEffect, useRef } from 'react';
import { Person } from '../types';
import { Trophy, RefreshCw, Repeat, ShieldBan, Sparkles } from 'lucide-react';

interface LuckyDrawProps {
  allNames: Person[];
}

const LuckyDraw: React.FC<LuckyDrawProps> = ({ allNames }) => {
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [availableNames, setAvailableNames] = useState<Person[]>(allNames);
  const [drawnWinners, setDrawnWinners] = useState<Person[]>([]);
  
  const [isRolling, setIsRolling] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<string>('???');
  const [lastWinner, setLastWinner] = useState<Person | null>(null);

  const rollIntervalRef = useRef<number | null>(null);

  // Sync available names if allNames changes (e.g. going back to input)
  useEffect(() => {
    // Only reset if we have more names than before or empty
    if (availableNames.length === 0 && allNames.length > 0 && drawnWinners.length === 0) {
      setAvailableNames(allNames);
    }
  }, [allNames]);

  const startDraw = () => {
    const pool = allowRepeat ? allNames : availableNames;

    if (pool.length === 0) {
      alert("No names left to draw! Please reset or allow repeats.");
      return;
    }

    setIsRolling(true);
    setLastWinner(null);

    // Animation Logic
    const duration = 2500; // 2.5 seconds spin
    const startTime = Date.now();

    const animate = () => {
      // Pick a random name for display effect
      const randomIdx = Math.floor(Math.random() * pool.length);
      setCurrentDisplay(pool[randomIdx].name);
    };

    rollIntervalRef.current = window.setInterval(animate, 50);

    // Stop logic
    setTimeout(() => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
      }
      
      // Select actual winner
      const winnerIndex = Math.floor(Math.random() * pool.length);
      const winner = pool[winnerIndex];
      
      setCurrentDisplay(winner.name);
      setLastWinner(winner);
      setDrawnWinners(prev => [winner, ...prev]);
      setIsRolling(false);

      if (!allowRepeat) {
        setAvailableNames(prev => prev.filter(p => p.id !== winner.id));
      }

    }, duration);
  };

  const resetDraw = () => {
    if (window.confirm("Reset all history?")) {
      setAvailableNames(allNames);
      setDrawnWinners([]);
      setLastWinner(null);
      setCurrentDisplay('???');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid lg:grid-cols-3 gap-8">
      {/* Left: Controls & Pool Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Settings
          </h2>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-6">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              {allowRepeat ? <Repeat size={16} /> : <ShieldBan size={16} />}
              {allowRepeat ? 'Allow Repeats' : 'Unique Winners'}
            </span>
            <button
              onClick={() => setAllowRepeat(!allowRepeat)}
              disabled={isRolling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allowRepeat ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${allowRepeat ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Pool:</span>
              <span className="font-semibold">{allowRepeat ? allNames.length : availableNames.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Winners:</span>
              <span className="font-semibold">{drawnWinners.length}</span>
            </div>
          </div>

          <button
            onClick={resetDraw}
            disabled={isRolling || drawnWinners.length === 0}
            className="mt-6 w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} /> Reset History
          </button>
        </div>

        {/* Recent Winners List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[300px] flex flex-col">
          <h3 className="font-semibold text-slate-700 mb-3">History</h3>
          <div className="flex-1 overflow-y-auto pr-2">
             {drawnWinners.length === 0 ? (
               <p className="text-slate-400 text-sm italic">No winners yet.</p>
             ) : (
               <ul className="space-y-2">
                 {drawnWinners.map((winner, idx) => (
                   <li key={`${winner.id}-${idx}`} className="flex items-center gap-3 p-2 bg-yellow-50 rounded border border-yellow-100">
                     <span className="flex items-center justify-center w-6 h-6 bg-yellow-200 text-yellow-700 rounded-full text-xs font-bold">
                       {drawnWinners.length - idx}
                     </span>
                     <span className="font-medium text-slate-800">{winner.name}</span>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>
      </div>

      {/* Right: The Stage */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[500px] bg-indigo-950 rounded-3xl relative overflow-hidden shadow-2xl">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center w-full max-w-lg px-4">
          <h3 className="text-indigo-200 font-medium tracking-widest uppercase mb-8">
            {isRolling ? 'Drawing Winner...' : lastWinner ? 'Congratulations!' : 'Ready to Draw'}
          </h3>
          
          <div className={`
            bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 mb-12
            transition-all duration-300 transform
            ${isRolling ? 'scale-105 shadow-[0_0_50px_rgba(255,255,255,0.3)]' : 'scale-100'}
            ${lastWinner ? 'ring-4 ring-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.5)]' : ''}
          `}>
            <div className={`text-5xl md:text-7xl font-black text-white tracking-tight break-words transition-all ${isRolling ? 'blur-[1px]' : ''}`}>
              {currentDisplay}
            </div>
          </div>

          <button
            onClick={startDraw}
            disabled={isRolling || (availableNames.length === 0 && !allowRepeat)}
            className={`
              w-full max-w-sm mx-auto group relative flex items-center justify-center gap-3
              py-4 px-8 rounded-full text-xl font-bold shadow-lg transition-all
              ${isRolling 
                ? 'bg-slate-600 cursor-wait text-slate-300' 
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-indigo-900 hover:scale-105 hover:shadow-orange-500/50'}
            `}
          >
            {isRolling ? (
              'Rolling...'
            ) : (
              <>
                <Sparkles className="group-hover:animate-spin" />
                Draw Winner
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LuckyDraw;
