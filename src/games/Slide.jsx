import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Web Audio API Procedural Sound Effects Engine ---
class SlideSoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft UI click
  playClick() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  // Tick sound as slider reel scrolls across the center line
  playTick(speedFactor = 1.0) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 * speedFactor, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.015);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.015);
    } catch (e) {}
  }

  // Win Fanfare Chord
  playWin() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 major arpeggio
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.12, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    } catch (e) {}
  }

  // Loss Thud
  playLoss() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

const audioSynth = new SlideSoundSynth();

// Generates provably fair house edge crash/slide outcome (99% RTP / 1% House Edge)
const generateOutcome = () => {
  const e = Math.pow(2, 52);
  const h = Math.floor(Math.random() * e);
  if (h % 100 === 0) return 1.0; // 1% instant bust at 1.00x
  const outcome = Math.floor((100 * e - h) / (e - h)) / 100;
  return Math.max(1.0, parseFloat(outcome.toFixed(2)));
};

// Calculate Win Chance % based on Target Multiplier
const calculateWinChance = (target) => {
  const t = parseFloat(target) || 1.01;
  if (t <= 1.0) return 99.0;
  const chance = (99.0 / t).toFixed(2);
  return Math.min(99.0, Math.max(0.01, parseFloat(chance)));
};

export default function App() {
  // Financial State
  const [balance, setBalance] = useState(1000.0);
  const [betAmount, setBetAmount] = useState('10.00');
  const [targetMultiplier, setTargetMultiplier] = useState('2.00');
  const [turboMode, setTurboMode] = useState(false);

  // Game Engine State: 'idle' | 'sliding' | 'ended'
  const [gameState, setGameState] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);
  const [isWin, setIsWin] = useState(false);

  // Session Tracking Stats
  const [totalRounds, setTotalRounds] = useState(0);
  const [sessionNetProfit, setSessionNetProfit] = useState(0.0);

  // Recent Outcomes Log
  const [recentOutcomes, setRecentOutcomes] = useState([
    { mult: 1.45, win: true },
    { mult: 3.20, win: true },
    { mult: 1.08, win: false },
    { mult: 12.50, win: true },
    { mult: 1.95, win: false },
    { mult: 2.10, win: true },
  ]);

  // Canvas Refs
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const slideStateRef = useRef({
    currentOffset: 0,
    targetOffset: 0,
    velocity: 0,
    outcome: 1.0,
    isAnimating: false,
    particles: [],
    lastTickIndex: -1,
  });

  const winChance = calculateWinChance(targetMultiplier);
  const targetVal = Math.max(1.01, parseFloat(targetMultiplier || '2.00'));
  const betVal = Math.max(0.1, parseFloat(betAmount || '0'));
  const potentialProfit = (betVal * targetVal - betVal).toFixed(2);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const state = slideStateRef.current;
    const pixelPerMultiplier = 120; // Width per 1.00x unit on slider
    const centerX = width / 2;

    // Clear Background
    ctx.fillStyle = '#111922';
    ctx.fillRect(0, 0, width, height);

    // Grid Pattern Overlay
    ctx.strokeStyle = '#1b2834';
    ctx.lineWidth = 1;
    const gridGap = 20;
    for (let x = 0; x < width; x += gridGap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Render Sliding Multiplier Tape / Track
    const offset = state.currentOffset;
    const minVisibleMult = Math.max(1, Math.floor((offset - centerX) / pixelPerMultiplier) - 2);
    const maxVisibleMult = Math.ceil((offset + centerX) / pixelPerMultiplier) + 3;

    // Center Laser Highlight Track Zone
    const targetX = centerX + (targetVal - (offset / pixelPerMultiplier + 1)) * pixelPerMultiplier;
    
    // Draw Target Zone Box on Slider Track
    ctx.fillStyle = 'rgba(0, 231, 1, 0.08)';
    ctx.fillRect(targetX, 20, width, height - 40);

    // Draw Multiplier Tick Marks & Labels
    for (let m = minVisibleMult; m <= maxVisibleMult; m += 0.5) {
      const x = centerX + (m - 1) * pixelPerMultiplier - offset;

      if (x < -100 || x > width + 100) continue;

      const isWhole = m % 1 === 0;
      const tickHeight = isWhole ? 36 : 20;
      const yStart = (height - tickHeight) / 2;

      // Tick Line
      ctx.strokeStyle = isWhole ? '#3a4e60' : '#233342';
      ctx.lineWidth = isWhole ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, yStart);
      ctx.lineTo(x, yStart + tickHeight);
      ctx.stroke();

      // Number Label
      if (isWhole) {
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = m >= targetVal ? '#00e701' : '#64748b';
        ctx.fillText(`${m.toFixed(2)}x`, x, height / 2 + 35);
      }
    }

    // Draw Target Multiplier Line Flag
    if (targetX >= 0 && targetX <= width) {
      ctx.strokeStyle = '#00e701';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(targetX, 0);
      ctx.lineTo(targetX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Target Badge Banner
      ctx.fillStyle = '#00e701';
      ctx.beginPath();
      ctx.roundRect(targetX - 35, 12, 70, 22, 4);
      ctx.fill();

      ctx.font = 'black 10px sans-serif';
      ctx.fillStyle = '#0f171e';
      ctx.textAlign = 'center';
      ctx.fillText(`TARGET ${targetVal.toFixed(2)}x`, targetX, 27);
    }

    // Render Particles Effect on Win
    if (state.particles.length > 0) {
      state.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      state.particles = state.particles.filter((p) => p.alpha > 0);
    }

    // Draw Main Center Cursor Indicator (Laser Crosshair)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Top Triangle Needle Pointer
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, 0);
    ctx.lineTo(centerX + 10, 0);
    ctx.lineTo(centerX, 15);
    ctx.closePath();
    ctx.fill();

    // Bottom Triangle Needle Pointer
    ctx.beginPath();
    ctx.moveTo(centerX - 10, height);
    ctx.lineTo(centerX + 10, height);
    ctx.lineTo(centerX, height - 15);
    ctx.closePath();
    ctx.fill();

    // Current Centered Multiplier Display Badge
    const currentCentMult = Math.max(1.0, 1 + offset / pixelPerMultiplier);
    ctx.fillStyle = '#162430';
    ctx.strokeStyle = '#2d4255';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(centerX - 45, height / 2 - 18, 90, 36, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'extrabold 15px monospace';
    ctx.fillStyle = currentCentMult >= targetVal ? '#00e701' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentCentMult.toFixed(2)}x`, centerX, height / 2 + 5);

  }, [targetVal]);

  const startSlideAnimation = (finalOutcome) => {
    audioSynth.init();
    audioSynth.playClick();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelPerMultiplier = 120;
    // Calculate total pixels needed to reach finalOutcome
    const targetOffset = (finalOutcome - 1) * pixelPerMultiplier;

    // Configure animation physics
    const state = slideStateRef.current;
    state.currentOffset = 0;
    state.targetOffset = targetOffset;
    state.outcome = finalOutcome;
    state.isAnimating = true;
    state.particles = [];
    state.lastTickIndex = -1;

    const duration = turboMode ? 1200 : 2800; // milliseconds
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Smooth Cubic-Ease-Out curve for realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      state.currentOffset = state.targetOffset * easeOut;

      // Tick Audio Sound on every 0.25x step
      const currentTickIndex = Math.floor(state.currentOffset / (pixelPerMultiplier * 0.25));
      if (currentTickIndex !== state.lastTickIndex) {
        state.lastTickIndex = currentTickIndex;
        audioSynth.playTick(1.0 - progress * 0.5);
      }

      renderCanvas();

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation Completed!
        state.currentOffset = state.targetOffset;
        state.isAnimating = false;

        const won = finalOutcome >= targetVal;
        setIsWin(won);
        setLastOutcome(finalOutcome);
        setGameState('ended');

        // Spawn Victory Particles if Won
        if (won) {
          audioSynth.playWin();
          const p = [];
          for (let i = 0; i < 40; i++) {
            p.push({
              x: canvas.width / 2,
              y: canvas.height / 2,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12,
              size: Math.random() * 5 + 3,
              alpha: 1.0,
              color: '0, 231, 1',
            });
          }
          state.particles = p;
          renderCanvas();

          // Calculate Payout
          const winPayout = parseFloat((betVal * targetVal).toFixed(2));
          const netWin = winPayout - betVal;
          setBalance((prev) => parseFloat((prev + winPayout).toFixed(2)));
          setSessionNetProfit((prev) => parseFloat((prev + netWin).toFixed(2)));
        } else {
          audioSynth.playLoss();
          setSessionNetProfit((prev) => parseFloat((prev - betVal).toFixed(2)));
        }

        setTotalRounds((prev) => prev + 1);
        setRecentOutcomes((prev) => [
          { mult: finalOutcome, win: won },
          ...prev.slice(0, 9),
        ]);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 240;
        renderCanvas();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderCanvas]);

  const handleStartSlide = () => {
    if (gameState === 'sliding') return;

    if (isNaN(betVal) || betVal <= 0 || betVal > balance) {
      return;
    }

    // Deduct Bet Amount
    setBalance((prev) => parseFloat((prev - betVal).toFixed(2)));
    setGameState('sliding');
    setLastOutcome(null);

    // Generate outcome
    const outcome = generateOutcome();
    startSlideAnimation(outcome);
  };

  const handleHalfBet = () => {
    audioSynth.playClick();
    setBetAmount((prev) => Math.max(0.1, parseFloat(prev || '0') / 2).toFixed(2));
  };

  const handleDoubleBet = () => {
    audioSynth.playClick();
    setBetAmount((prev) => Math.min(balance, parseFloat(prev || '0') * 2).toFixed(2));
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioSynth.muted = nextMute;
  };

  const handleReloadBalance = () => {
    setBalance(1000.0);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f171e] text-slate-100 font-sans flex flex-col justify-between select-none overflow-x-hidden">
      
      {/* Outer Shell Wrapper */}
      <div className="flex flex-col lg:flex-row flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-4 gap-4">
        
        {/* ================= LEFT CONTROLS PANEL ================= */}
        <div className="w-full lg:w-[320px] xl:w-[360px] bg-[#1a242d] rounded-xl border border-[#21303c] p-4 flex flex-col justify-between shrink-0 shadow-xl">
          <div className="space-y-4">
            
            {/* Header: Logo + Mute Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-[#243340]">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#00e701]/20 text-[#00e701] font-black text-xs">
                  S
                </span>
                <span className="font-extrabold text-sm tracking-wider uppercase text-white flex items-center gap-1.5">
                  STAKE <span className="text-slate-400">SLIDE</span> 🎰
                </span>
              </div>
              <button
                onClick={handleMuteToggle}
                className="p-1.5 rounded-lg bg-[#21303c] hover:bg-[#2c3e4e] text-slate-300 transition"
                title="Toggle Sound"
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>

            {/* Available Balance Header */}
            <div className="bg-[#131b23] p-3 rounded-lg border border-[#21303c] space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>AVAILABLE BALANCE</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#00e701]/20 text-[#00e701] font-extrabold">
                  LIVE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-black text-[#00e701] font-mono tracking-tight">
                  $ {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                {balance < 10 && (
                  <button
                    onClick={handleReloadBalance}
                    className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-amber-300 font-bold transition"
                  >
                    + Reload
                  </button>
                )}
              </div>
            </div>

            {/* Bet Amount Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Bet Amount</span>
                <span>${betVal.toFixed(2)}</span>
              </div>

              <div className="flex items-center bg-[#0f171e] rounded-lg border border-[#263746] focus-within:border-[#00e701] transition overflow-hidden p-1">
                <input
                  type="number"
                  min="0.10"
                  step="1.00"
                  disabled={gameState === 'sliding'}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-transparent px-2 text-sm font-mono font-bold text-white focus:outline-none disabled:opacity-50"
                />
                <div className="flex items-center gap-1">
                  <button
                    disabled={gameState === 'sliding'}
                    onClick={handleHalfBet}
                    className="px-2.5 py-1 bg-[#21303c] hover:bg-[#2c3e4e] rounded text-xs font-bold text-slate-300 transition active:scale-95 disabled:opacity-50"
                  >
                    ½
                  </button>
                  <button
                    disabled={gameState === 'sliding'}
                    onClick={handleDoubleBet}
                    className="px-2.5 py-1 bg-[#21303c] hover:bg-[#2c3e4e] rounded text-xs font-bold text-slate-300 transition active:scale-95 disabled:opacity-50"
                  >
                    2×
                  </button>
                </div>
              </div>
            </div>

            {/* Target Multiplier Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Target Multiplier</span>
                <span className="text-[#00e701] font-mono">{targetVal.toFixed(2)}x</span>
              </div>

              <div className="flex items-center bg-[#0f171e] rounded-lg border border-[#263746] focus-within:border-[#00e701] transition overflow-hidden p-2">
                <input
                  type="number"
                  min="1.01"
                  max="1000.00"
                  step="0.10"
                  disabled={gameState === 'sliding'}
                  value={targetMultiplier}
                  onChange={(e) => setTargetMultiplier(e.target.value)}
                  className="w-full bg-transparent px-2 text-sm font-mono font-bold text-white focus:outline-none disabled:opacity-50"
                />
                <span className="text-slate-500 font-extrabold text-xs">MULT</span>
              </div>
            </div>

            {/* Quick Multiplier Presets */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400">Quick Targets</div>
              <div className="grid grid-cols-5 gap-1.5">
                {['1.50', '2.00', '3.00', '5.00', '10.00'].map((preset) => (
                  <button
                    key={preset}
                    disabled={gameState === 'sliding'}
                    onClick={() => {
                      audioSynth.playClick();
                      setTargetMultiplier(preset);
                    }}
                    className={`py-1.5 rounded text-xs font-extrabold border transition ${
                      targetMultiplier === preset
                        ? 'bg-[#00e701]/20 border-[#00e701] text-[#00e701]'
                        : 'bg-[#0f171e] border-[#263746] text-slate-300 hover:bg-[#21303c]'
                    } disabled:opacity-50`}
                  >
                    {preset}x
                  </button>
                ))}
              </div>
            </div>

            {/* Turbo Mode Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#131b23] rounded-lg border border-[#21303c]">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                ⚡ Turbo Speed Mode
              </span>
              <button
                disabled={gameState === 'sliding'}
                onClick={() => setTurboMode(!turboMode)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  turboMode ? 'bg-[#00e701]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    turboMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleStartSlide}
              disabled={gameState === 'sliding' || balance < betVal || betVal <= 0}
              className={`w-full py-3.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#00e701]/15 ${
                gameState === 'sliding'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-[#00e701] hover:bg-[#00c401] text-slate-950 active:scale-98'
              }`}
            >
              {gameState === 'sliding' ? 'SLIDING...' : 'BET / START SLIDE'}
            </button>

          </div>

          {/* Footer Provably Fair Verification */}
          <div className="pt-4 mt-4 border-t border-[#243340] flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1 text-[#00e701]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] animate-ping" />
              Provably Fair SHA-256
            </span>
            <span className="text-slate-400">RTP 99.0%</span>
          </div>

        </div>

        {/* ================= RIGHT MAIN VIEWPORT ================= */}
        <div className="flex-1 bg-[#162029] rounded-xl border border-[#21303c] p-4 flex flex-col justify-between space-y-4 shadow-xl">
          
          {/* Top Bar: Recent Slide Outcomes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#21303c]">
            <span className="text-xs font-black text-[#00e701] uppercase tracking-wider">
              RECENT OUTCOMES:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar">
              {recentOutcomes.map((rd, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition shrink-0 ${
                    rd.win
                      ? 'bg-[#00e701]/10 border-[#00e701]/30 text-[#00e701]'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {rd.mult.toFixed(2)}x
                </span>
              ))}
            </div>
          </div>

          {/* Middle Stats Bar (3 Metric Cards) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            
            {/* Card 1: Win Chance */}
            <div className="bg-[#1a2530] p-3 rounded-lg border border-[#233342] text-center space-y-1">
              <div className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                WIN CHANCE
              </div>
              <div className="text-sm sm:text-lg font-black text-[#38bdf8] font-mono">
                {winChance}%
              </div>
            </div>

            {/* Card 2: Target Multiplier */}
            <div className="bg-[#1a2530] p-3 rounded-lg border border-[#233342] text-center space-y-1">
              <div className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                TARGET MULTIPLIER
              </div>
              <div className="text-sm sm:text-lg font-black text-[#00e701] font-mono">
                {targetVal.toFixed(2)}x
              </div>
            </div>

            {/* Card 3: Potential Profit */}
            <div className="bg-[#1a2530] p-3 rounded-lg border border-[#233342] text-center space-y-1">
              <div className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                PROFIT ON WIN
              </div>
              <div className="text-sm sm:text-lg font-black text-amber-400 font-mono">
                +${potentialProfit}
              </div>
            </div>

          </div>

          {/* ================= MAIN CANVAS SLIDE VIEWPORT ================= */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 relative">
            <div className="w-full bg-[#111922] rounded-xl border border-[#233342] overflow-hidden shadow-inner relative">
              <canvas
                ref={canvasRef}
                className="w-full h-[240px] block cursor-crosshair"
              />
            </div>
          </div>

          {/* Floating Status Toast */}
          <div className="text-center py-1">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#111922] border border-[#233240] text-xs font-semibold text-slate-300 shadow-md">
              {gameState === 'idle' && 'Select target multiplier and press BET to slide!'}
              {gameState === 'sliding' && '🎰 Slider spinning... decelerating towards target!'}
              {gameState === 'ended' &&
                (isWin
                  ? `🎉 LANDED ON ${lastOutcome.toFixed(2)}x! YOU WON +$${potentialProfit}!`
                  : `💥 LANDED ON ${lastOutcome.toFixed(2)}x (Needed ${targetVal.toFixed(2)}x). Better luck next slide!`)}
            </span>
          </div>

          {/* Bottom Session Stats Bar */}
          <div className="grid grid-cols-3 bg-[#131c24] p-3 rounded-lg border border-[#21303c] text-xs font-bold text-slate-400 text-center">
            <div>
              Total Rounds: <span className="text-white font-mono ml-1">{totalRounds}</span>
            </div>
            <div>
              Net Session Profit:{' '}
              <span
                className={`font-mono ml-1 ${
                  sessionNetProfit >= 0 ? 'text-[#00e701]' : 'text-red-400'
                }`}
              >
                ${sessionNetProfit.toFixed(2)}
              </span>
            </div>
            <div>
              House Edge: <span className="text-emerald-400 font-mono ml-1">1.0%</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}