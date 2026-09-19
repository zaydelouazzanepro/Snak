import React, { useState, useEffect, useCallback } from 'react';

// Web Audio API Synthesizer for game sound effects
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playGem() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playBomb() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Low bass blast noise
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playCashout() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
    } catch (e) {}
  }
}

const soundFX = new SoundEngine();

const GemIcon = ({ size = 44, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <path d="M32 6 L54 22 L32 58 L10 22 Z" fill="url(#gemBodyGrad)" />
    <path d="M32 6 L42 22 L32 58 L22 22 Z" fill="url(#gemFacetGrad)" />
    <path d="M10 22 L54 22 L42 6 L22 6 Z" fill="#38bdf8" opacity="0.8" />
    <path d="M32 6 L22 22 L10 22 Z" fill="#7dd3fc" opacity="0.9" />
    <path d="M32 6 L42 22 L54 22 Z" fill="#0284c7" opacity="0.7" />
    <defs>
      <linearGradient id="gemBodyGrad" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="0.5" stopColor="#0284c7" />
        <stop offset="1" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="gemFacetGrad" x1="22" y1="6" x2="42" y2="58" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7dd3fc" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

const BombIcon = ({ size = 44, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    {/* Explosive Aura */}
    <circle cx="32" cy="38" r="22" fill="#ef4444" opacity="0.2" />
    {/* Bomb Sphere */}
    <circle cx="32" cy="38" r="18" fill="url(#bombGrad)" />
    <circle cx="26" cy="32" r="4" fill="#ffffff" opacity="0.25" />
    {/* Fuse Cap & Fuse */}
    <rect x="29" y="16" width="6" height="5" rx="1.5" fill="#64748b" />
    <path d="M32 16 C32 10, 42 12, 44 6" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
    {/* Fuse Spark */}
    <circle cx="44" cy="6" r="3" fill="#ef4444" />
    <circle cx="44" cy="6" r="1.5" fill="#fef08a" />
    <defs>
      <linearGradient id="bombGrad" x1="18" y1="20" x2="46" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#334155" />
        <stop offset="0.7" stopColor="#0f172a" />
        <stop offset="1" stopColor="#020617" />
      </linearGradient>
    </defs>
  </svg>
);

const TilePatternIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <path d="M16 4 L28 16 L16 28 L4 16 Z" fill="#2f4553" stroke="#475569" strokeWidth="1.5" />
  </svg>
);

const Volume2Icon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const VolumeXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m0 -13l2.1 2.1m8.8 8.8l2.1 2.1" />
  </svg>
);

const TOTAL_TILES = 25;
const HOUSE_EDGE = 0.01; // 1% House edge

// Combination formula nCr
function combinations(n, r) {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  if (r > n / 2) r = n - r;
  let res = 1;
  for (let i = 1; i <= r; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return res;
}

// Calculate precise Stake Multiplier based on total tiles (25), mine count, and revealed gems count
function calculateMultiplier(mineCount, gemsRevealed) {
  if (gemsRevealed === 0) return 1.00;
  const safeTiles = TOTAL_TILES - mineCount;
  if (gemsRevealed > safeTiles) return 0;

  // Multiplier = (1 - HouseEdge) * [ C(25, k) / C(25 - M, k) ]
  const totalCombos = combinations(TOTAL_TILES, gemsRevealed);
  const safeCombos = combinations(safeTiles, gemsRevealed);
  
  if (safeCombos === 0) return 0;
  const rawMultiplier = (1 - HOUSE_EDGE) * (totalCombos / safeCombos);
  return parseFloat(rawMultiplier.toFixed(2));
}

export default function App() {
  // Game Configuration State
  const [balance, setBalance] = useState(1000.00);
  const [betAmount, setBetAmount] = useState('10.00');
  const [mineCount, setMineCount] = useState(3); // Default 3 mines out of 25 tiles
  const [isMuted, setIsMuted] = useState(false);

  // Active Game State: 'idle' | 'playing' | 'cashed_out' | 'busted'
  const [gameState, setGameState] = useState('idle');
  const [grid, setGrid] = useState([]); // Array of 25 objects: { id, type: 'gem'|'bomb', revealed: boolean, isExploded: boolean }
  const [revealedCount, setRevealedCount] = useState(0);
  const [activeBet, setActiveBet] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [nextMultiplier, setNextMultiplier] = useState(1.00);

  // History & Notification Messages
  const [history, setHistory] = useState([
    { mult: 1.45, won: true, profit: 4.50 },
    { mult: 2.10, won: true, profit: 11.00 },
    { mult: 0.00, won: false, profit: -10.00 },
    { mult: 3.50, won: true, profit: 25.00 },
    { mult: 1.12, won: true, profit: 1.20 }
  ]);
  const [message, setMessage] = useState({ type: 'info', text: 'Choose bet amount & mines, then click BET to start!' });

  useEffect(() => {
    if (gameState === 'idle') {
      setNextMultiplier(calculateMultiplier(mineCount, 1));
    } else if (gameState === 'playing') {
      setCurrentMultiplier(calculateMultiplier(mineCount, revealedCount));
      setNextMultiplier(calculateMultiplier(mineCount, revealedCount + 1));
    }
  }, [mineCount, revealedCount, gameState]);

  const initializeGrid = () => {
    return Array.from({ length: TOTAL_TILES }, (_, index) => ({
      id: index,
      type: 'gem',
      revealed: false,
      isExploded: false
    }));
  };

  useEffect(() => {
    setGrid(initializeGrid());
  }, []);

  const handleStartGame = () => {
    soundFX.init();
    const amount = parseFloat(betAmount);

    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid bet amount.' });
      return;
    }

    if (amount > balance) {
      setMessage({ type: 'error', text: 'Insufficient balance to place this bet!' });
      return;
    }

    // Deduct Balance
    setBalance(prev => parseFloat((prev - amount).toFixed(2)));
    setActiveBet(amount);

    // Randomly place Mines in the 25-grid
    const newGrid = initializeGrid();
    const mineIndices = new Set();
    while (mineIndices.size < mineCount) {
      const rand = Math.floor(Math.random() * TOTAL_TILES);
      mineIndices.add(rand);
    }

    mineIndices.forEach(idx => {
      newGrid[idx].type = 'bomb';
    });

    setGrid(newGrid);
    setRevealedCount(0);
    setCurrentMultiplier(1.00);
    setNextMultiplier(calculateMultiplier(mineCount, 1));
    setGameState('playing');
    setMessage({ type: 'info', text: 'Select tiles! Uncover Gems 💎 and avoid Mines 💣.' });
    soundFX.playClick();
  };

  const handleTileClick = (index) => {
    if (gameState !== 'playing' || grid[index].revealed) return;

    soundFX.init();
    const tile = grid[index];
    const updatedGrid = [...grid];
    updatedGrid[index] = { ...tile, revealed: true };

    if (tile.type === 'bomb') {
      // BUST! User hit a Mine
      updatedGrid[index].isExploded = true;
      
      // Reveal all other tiles
      const finalGrid = updatedGrid.map(t => ({ ...t, revealed: true }));
      setGrid(finalGrid);
      setGameState('busted');
      soundFX.playBomb();

      setMessage({ type: 'loss', text: `BOOM! You hit a Mine 💣. Lost $${activeBet.toFixed(2)}.` });

      // Add to history
      setHistory(prev => [{ mult: 0.00, won: false, profit: -activeBet }, ...prev.slice(0, 9)]);
    } else {
      // GEM! Safe tile
      const newRevealedCount = revealedCount + 1;
      setRevealedCount(newRevealedCount);
      setGrid(updatedGrid);
      soundFX.playGem();

      const newMult = calculateMultiplier(mineCount, newRevealedCount);
      setCurrentMultiplier(newMult);

      const safeGemCount = TOTAL_TILES - mineCount;
      if (newRevealedCount === safeGemCount) {
        // Uncovered all safe gems! Automatic maximum payout!
        const totalPayout = parseFloat((activeBet * newMult).toFixed(2));
        const profit = totalPayout - activeBet;

        setBalance(prev => parseFloat((prev + totalPayout).toFixed(2)));
        setGameState('cashed_out');
        soundFX.playCashout();

        setMessage({ type: 'win', text: `ALL GEMS UNCOVERED! Won $${totalPayout.toFixed(2)} (${newMult}x)` });
        setHistory(prev => [{ mult: newMult, won: true, profit }, ...prev.slice(0, 9)]);
      } else {
        setMessage({ type: 'win', text: `Gem found! 💎 Multiplier: ${newMult}x` });
      }
    }
  };

  const handleCashout = () => {
    if (gameState !== 'playing' || revealedCount === 0) return;

    soundFX.init();
    const totalPayout = parseFloat((activeBet * currentMultiplier).toFixed(2));
    const profit = totalPayout - activeBet;

    setBalance(prev => parseFloat((prev + totalPayout).toFixed(2)));
    setGameState('cashed_out');

    // Reveal remaining grid tiles
    const finalGrid = grid.map(t => ({ ...t, revealed: true }));
    setGrid(finalGrid);
    soundFX.playCashout();

    setMessage({ type: 'win', text: `Cashed out $${totalPayout.toFixed(2)} @ ${currentMultiplier}x!` });
    setHistory(prev => [{ mult: currentMultiplier, won: true, profit }, ...prev.slice(0, 9)]);
  };

  const handlePickRandom = () => {
    if (gameState !== 'playing') return;
    const unrevealedIndices = grid
      .map((t, idx) => (!t.revealed ? idx : null))
      .filter(idx => idx !== null);

    if (unrevealedIndices.length > 0) {
      const randIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      handleTileClick(randIdx);
    }
  };

  const handleHalfBet = () => {
    if (gameState === 'playing') return;
    const val = Math.max(0.1, parseFloat(betAmount || '0') / 2);
    setBetAmount(val.toFixed(2));
  };

  const handleDoubleBet = () => {
    if (gameState === 'playing') return;
    const val = parseFloat(betAmount || '0') * 2;
    setBetAmount(val.toFixed(2));
  };

  const toggleMute = () => {
    soundFX.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const safeGemCount = TOTAL_TILES - mineCount;
  const currentPayout = parseFloat((activeBet * currentMultiplier).toFixed(2));

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#0f212e] text-white font-sans overflow-hidden select-none">
      
      {/* LEFT SIDEBAR CONTROL PANEL */}
      <div className="w-full lg:w-80 bg-[#1a2c38] p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2f4553] z-20 shrink-0 overflow-y-auto">
        <div className="space-y-4">
          
          {/* Header Branding */}
          <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-[#00e701] p-1.5 rounded-lg text-black font-black text-xs tracking-wider flex items-center space-x-1 shadow-md shadow-[#00e701]/20">
                <SparklesIcon />
                <span>STAKE</span>
              </div>
              <span className="font-extrabold tracking-wide text-sm text-gray-200">MINES 💣</span>
            </div>
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white bg-[#0f212e] rounded-lg border border-[#2f4553] transition"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeXIcon /> : <Volume2Icon />}
            </button>
          </div>

          {/* User Balance Display */}
          <div className="bg-[#0f212e] p-3.5 rounded-xl border border-[#2f4553] shadow-inner">
            <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center justify-between">
              <span>AVAILABLE BALANCE</span>
              <span className="text-[#00e701] text-[10px] bg-[#00e701]/10 px-2 py-0.5 rounded-full font-mono font-bold border border-[#00e701]/30">
                LIVE
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-white flex items-center">
              <span className="text-[#00e701] mr-1.5">$</span>
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Bet Input Section */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
              <span>Bet Amount</span>
              <span className="text-gray-300 font-mono">${parseFloat(betAmount || '0').toFixed(2)}</span>
            </div>

            <div className="relative flex items-center bg-[#0f212e] rounded-xl border border-[#2f4553] focus-within:border-[#00e701] transition overflow-hidden">
              <input
                type="number"
                min="0.1"
                step="1"
                disabled={gameState === 'playing'}
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-white focus:outline-none disabled:opacity-50"
                placeholder="0.00"
              />

              <div className="flex border-l border-[#2f4553] shrink-0">
                <button
                  onClick={handleHalfBet}
                  disabled={gameState === 'playing'}
                  className="px-3 py-2.5 text-xs font-bold text-gray-300 hover:bg-[#2f4553] transition disabled:opacity-50"
                >
                  ½
                </button>
                <button
                  onClick={handleDoubleBet}
                  disabled={gameState === 'playing'}
                  className="px-3 py-2.5 text-xs font-bold text-gray-300 border-l border-[#2f4553] hover:bg-[#2f4553] transition disabled:opacity-50"
                >
                  2×
                </button>
              </div>
            </div>
          </div>

          {/* Mines Count Selector */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
              <span>Mines 💣</span>
              <span className="text-sky-400 font-mono font-bold">{mineCount} Mines ({safeGemCount} Gems 💎)</span>
            </div>

            <select
              disabled={gameState === 'playing'}
              value={mineCount}
              onChange={(e) => setMineCount(parseInt(e.target.value, 10))}
              className="w-full bg-[#0f212e] text-white font-mono text-sm border border-[#2f4553] rounded-xl p-2.5 focus:outline-none focus:border-[#00e701] transition disabled:opacity-50 cursor-pointer"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((cnt) => (
                <option key={cnt} value={cnt}>
                  {cnt} {cnt === 1 ? 'Mine' : 'Mines'} — ({25 - cnt} Gems)
                </option>
              ))}
            </select>
          </div>

          {/* Preset Quick Mine Buttons */}
          <div>
            <div className="text-[11px] font-semibold text-gray-400 mb-1">Quick Presets</div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 3, 5, 10, 24].map((cnt) => (
                <button
                  key={cnt}
                  disabled={gameState === 'playing'}
                  onClick={() => setMineCount(cnt)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                    mineCount === cnt
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500'
                      : 'bg-[#0f212e] text-gray-400 border-[#2f4553] hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {gameState === 'playing' ? (
              <>
                <button
                  onClick={handleCashout}
                  disabled={revealedCount === 0}
                  className={`w-full py-4 rounded-xl font-extrabold text-base tracking-wide shadow-lg transition transform active:scale-98 flex flex-col items-center justify-center ${
                    revealedCount > 0
                      ? 'bg-[#00e701] hover:bg-[#00c701] text-black shadow-[#00e701]/20'
                      : 'bg-[#2f4553] text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs uppercase font-black tracking-wider opacity-80">Cash Out</span>
                  <span className="text-xl font-mono">${currentPayout.toFixed(2)}</span>
                </button>

                <button
                  onClick={handlePickRandom}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#0f212e] hover:bg-[#2f4553] text-gray-200 border border-[#2f4553] transition"
                >
                  Pick Random Tile 🎲
                </button>
              </>
            ) : (
              <button
                onClick={handleStartGame}
                className="w-full py-4 rounded-xl font-bold text-base tracking-wide bg-[#00e701] hover:bg-[#00c701] text-black shadow-lg shadow-[#00e701]/20 transition transform active:scale-98 flex items-center justify-center space-x-2"
              >
                <span>BET / START GAME</span>
              </button>
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-[#2f4553] text-[11px] text-gray-500 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[#00e701]">
            <ShieldIcon />
            <span>Provably Fair SHA-256</span>
          </div>
          <span>RTP 99.0%</span>
        </div>
      </div>

      {/* RIGHT MAIN GAME CANVAS / GRID AREA */}
      <div className="flex-1 flex flex-col justify-between p-4 lg:p-6 overflow-y-auto bg-[#0f212e] relative">
        
        {/* Top Bar - Spin / Round History */}
        <div className="flex items-center justify-between bg-[#1a2c38] p-2.5 rounded-2xl border border-[#2f4553] mb-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold shrink-0">
            <span className="text-[#00e701] font-bold">RECENT ROUNDS:</span>
          </div>
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {history.map((h, idx) => (
              <div
                key={idx}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs shadow shrink-0 ${
                  h.won
                    ? 'bg-[#00e701]/20 text-[#00e701] border border-[#00e701]/40'
                    : 'bg-[#ff3b5c]/20 text-[#ff3b5c] border border-[#ff3b5c]/40'
                } ${idx === 0 ? 'scale-105 font-black' : 'opacity-80'}`}
              >
                {h.won ? `${h.mult.toFixed(2)}x` : '0.00x'}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Status / Multiplier Bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#1a2c38] p-3 rounded-2xl border border-[#2f4553] text-center">
            <div className="text-[11px] font-semibold text-gray-400">GEMS FOUND</div>
            <div className="text-lg font-mono font-bold text-sky-400">
              {revealedCount} / {safeGemCount} 💎
            </div>
          </div>
          <div className="bg-[#1a2c38] p-3 rounded-2xl border border-[#2f4553] text-center">
            <div className="text-[11px] font-semibold text-gray-400">CURRENT MULTIPLIER</div>
            <div className="text-xl font-mono font-extrabold text-[#00e701]">
              {currentMultiplier.toFixed(2)}x
            </div>
          </div>
          <div className="bg-[#1a2c38] p-3 rounded-2xl border border-[#2f4553] text-center">
            <div className="text-[11px] font-semibold text-gray-400">NEXT GEM MULTIPLIER</div>
            <div className="text-lg font-mono font-bold text-amber-400">
              {nextMultiplier.toFixed(2)}x
            </div>
          </div>
        </div>

        {/* 5x5 MINES GRID CONTAINER */}
        <div className="flex-1 flex flex-col items-center justify-center relative rounded-3xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl p-4 sm:p-6 min-h-95">
          
          <div className="grid grid-cols-5 gap-2.5 sm:gap-4 w-full max-w-lg aspect-square">
            {grid.map((tile, idx) => {
              const isInteractive = gameState === 'playing' && !tile.revealed;

              return (
                <button
                  key={tile.id}
                  disabled={!isInteractive}
                  onClick={() => handleTileClick(idx)}
                  className={`relative rounded-2xl border transition-all duration-300 transform flex items-center justify-center p-2 shadow-lg overflow-hidden ${
                    tile.revealed
                      ? tile.type === 'bomb'
                        ? tile.isExploded
                          ? 'bg-red-950/90 border-red-500 scale-95 shadow-red-500/40 ring-2 ring-red-500'
                          : 'bg-[#0f212e] border-red-900/50 opacity-60'
                        : 'bg-sky-950/60 border-sky-400 scale-95 shadow-sky-500/20'
                      : 'bg-[#213743] border-[#2f4553] hover:bg-[#2f4553] hover:border-gray-400 hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {tile.revealed ? (
                    <div className="animate-in fade-in zoom-in duration-200 flex flex-col items-center justify-center">
                      {tile.type === 'gem' ? (
                        <GemIcon size={38} />
                      ) : (
                        <BombIcon size={36} />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition">
                      <TilePatternIcon size={32} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Overlay Status Message */}
          <div className={`mt-4 px-4 py-2 rounded-full text-xs font-bold border transition text-center ${
            message.type === 'win'
              ? 'bg-[#00e701]/20 border-[#00e701] text-[#00e701] shadow-lg shadow-[#00e701]/20'
              : message.type === 'loss'
              ? 'bg-[#ff3b5c]/20 border-[#ff3b5c] text-[#ff3b5c]'
              : message.type === 'error'
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-[#0f212e]/90 border-[#2f4553] text-gray-300'
          }`}>
            {message.text}
          </div>

        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-semibold text-gray-400">
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span>Grid Layout</span>
            <span className="font-mono text-white">5 × 5 (25)</span>
          </div>
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span>Safe Gems</span>
            <span className="font-mono text-sky-400">{safeGemCount}</span>
          </div>
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span>House Edge</span>
            <span className="font-mono text-gray-300">1.0%</span>
          </div>
        </div>

      </div>
    </div>
  );
}