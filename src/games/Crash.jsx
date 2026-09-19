import React, { useState, useEffect, useRef, useCallback } from 'react';

// Quick bet presets
const QUICK_BET_AMOUNTS = [1, 5, 10, 25, 50, 100];

// Inline SVG Icon Components to prevent missing package dependencies
const TrendingUpIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const Volume2Icon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const VolumeXIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const ShieldIcon = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const HistoryIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
);

const FlameIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3" />
  </svg>
);

class SoundEffects {
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

  playBet() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      // Audio context error fallback
    }
  }

  playWin() {
    if (this.muted || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
      });
    } catch (e) {
      // Audio fallback
    }
  }

  playCrash() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      // Audio fallback
    }
  }
}

const soundFX = new SoundEffects();

export default function App() {
  /*
  // 1. Backend User Balance state
  const [userBalance, setUserBalance] = useState(1000.00);

  // 2. Active Bet Payload state sent to backend endpoint /api/crash/bet
  const [activeBetPayload, setActiveBetPayload] = useState({
    userId: 'USER_12345',
    betAmount: 10.00,
    autoCashout: 2.00
  });

  // 3. Round Outcome State from Backend
  const [backendRoundResult, setBackendRoundResult] = useState({
    crashPoint: 2.45,
    userCashedOut: true,
    cashedOutAt: 2.00,
    payout: 20.00,
    netProfit: 10.00
  });

  // 4. Function to place bet via backend API
  const sendBetToBackend = async (amount, targetAutoCashout) => {
    try {
      const response = await fetch('/api/crash/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'USER_12345',
          betAmount: amount,
          autoCashout: targetAutoCashout
        })
      });
      const data = await response.json();
      // data: { success: true, crashPoint: 3.52, newBalance: 990.00 }
      return data;
    } catch (err) {
      console.error('Failed to submit crash bet to server:', err);
    }
  };

  // 5. Function to cashout via backend API
  const sendCashoutToBackend = async (multiplier) => {
    try {
      const response = await fetch('/api/crash/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'USER_12345',
          cashedOutAt: multiplier
        })
      });
      const data = await response.json();
      // setUserBalance(data.updatedBalance);
    } catch (err) {
      console.error('Failed to register cashout on server:', err);
    }
  };
  */

  const [balance, setBalance] = useState(1000.00);
  const [betAmount, setBetAmount] = useState('10.00');
  const [autoCashout, setAutoCashout] = useState('2.00');
  const [mode, setMode] = useState('manual');
  const [gameSpeed, setGameSpeed] = useState(1.5); // 1x, 1.5x, 2x, 3x speed
  const [isMuted, setIsMuted] = useState(false);

  const [gameState, setGameState] = useState('idle'); // 'idle' | 'in_progress' | 'crashed'
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashedOutAt, setCashedOutAt] = useState(null);
  const [payoutWon, setPayoutWon] = useState(0);

  const [isBetQueued, setIsBetQueued] = useState(false);
  const [gameMessage, setGameMessage] = useState({ type: '', text: 'Place your bet to start.' });
  const [history, setHistory] = useState([1.85, 12.40, 1.12, 2.05, 5.60, 1.04, 3.20, 1.45]);

  const canvasRef = useRef(null);
  
  // Mutable animation state references
  const animState = useRef({
    running: false,
    startTime: 0,
    multiplier: 1.00,
    crashPoint: 1.00,
    placedBetAmount: 0,
    hasCashedOutRef: false,
    autoCashoutRef: 2.00,
    particles: []
  });

  // Keep autoCashout ref continuously synced
  useEffect(() => {
    const val = parseFloat(autoCashout);
    animState.current.autoCashoutRef = !isNaN(val) && val >= 1.01 ? val : null;
  }, [autoCashout]);

  const triggerCashout = useCallback((targetMultiplier) => {
    if (animState.current.hasCashedOutRef || !animState.current.running) return;

    animState.current.hasCashedOutRef = true;
    const bet = animState.current.placedBetAmount;
    if (bet <= 0) return;

    const payout = parseFloat((bet * targetMultiplier).toFixed(2));
    setHasCashedOut(true);
    setCashedOutAt(targetMultiplier);
    setPayoutWon(payout);
    setBalance((prev) => parseFloat((prev + payout).toFixed(2)));
    setGameMessage({ type: 'win', text: `Cashed out @ ${targetMultiplier.toFixed(2)}x (+${payout.toFixed(2)})` });
    soundFX.playWin();
  }, []);

  const startRound = useCallback((activeBet) => {
    soundFX.init();
    
    // Generate crash point (1.00x to ~100x using house edge formula)
    const e = 100;
    const r = Math.random() * e;
    let crash = 1.00;
    if (r >= 3) { // 3% house edge instant crash @ 1.00x
      crash = parseFloat((Math.max(1.00, (100 / (100 - r)))).toFixed(2));
    }

    animState.current = {
      running: true,
      startTime: performance.now(),
      multiplier: 1.00,
      crashPoint: crash,
      placedBetAmount: activeBet,
      hasCashedOutRef: false,
      autoCashoutRef: parseFloat(autoCashout) || null,
      particles: []
    };

    setGameState('in_progress');
    setHasCashedOut(false);
    setCashedOutAt(null);
    setPayoutWon(0);
    setCurrentMultiplier(1.00);
    setGameMessage({ type: '', text: 'Rocket launched!' });

    // Animation Loop
    let animFrameId;

    const loop = (now) => {
      if (!animState.current.running) return;

      const elapsed = (now - animState.current.startTime) / 1000; // seconds
      // Accelerated exponential growth curve: base rate 0.20 multiplied by selected speed
      const speedRate = 0.20 * gameSpeed;
      const newMultiplier = parseFloat((Math.exp(speedRate * elapsed)).toFixed(2));

      // 1. Instant Auto-Cashout Check
      const targetAuto = animState.current.autoCashoutRef;
      if (
        !animState.current.hasCashedOutRef &&
        animState.current.placedBetAmount > 0 &&
        targetAuto &&
        targetAuto > 1.00 &&
        newMultiplier >= targetAuto &&
        targetAuto <= animState.current.crashPoint
      ) {
        triggerCashout(targetAuto);
      }

      // 2. Crash Check
      if (newMultiplier >= animState.current.crashPoint) {
        animState.current.running = false;
        const finalCrash = animState.current.crashPoint;

        // If auto-cashout target was reached on or before crash point but missed in previous frame
        if (
          !animState.current.hasCashedOutRef &&
          animState.current.placedBetAmount > 0 &&
          targetAuto &&
          targetAuto <= finalCrash
        ) {
          triggerCashout(targetAuto);
        } else if (!animState.current.hasCashedOutRef && animState.current.placedBetAmount > 0) {
          soundFX.playCrash();
          setGameMessage({ type: 'loss', text: `Crashed at ${finalCrash.toFixed(2)}x!` });
        } else {
          soundFX.playCrash();
        }

        setGameState('crashed');
        setCurrentMultiplier(finalCrash);
        setHistory((prev) => [finalCrash, ...prev.slice(0, 9)]);

        // Faster inter-round cooldown delay (1.2s instead of 3s)
        setTimeout(() => {
          setGameState('idle');
          if (isBetQueued) {
            setIsBetQueued(false);
            const nextAmount = parseFloat(betAmount);
            if (!isNaN(nextAmount) && nextAmount > 0 && balance >= nextAmount) {
              setBalance((prev) => parseFloat((prev - nextAmount).toFixed(2)));
              startRound(nextAmount);
            }
          }
        }, 1200);

        return;
      }

      setCurrentMultiplier(newMultiplier);
      animState.current.multiplier = newMultiplier;
      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
  }, [autoCashout, betAmount, balance, isBetQueued, triggerCashout, gameSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let renderId;

    const render = () => {
      const w = canvas.width = canvas.parentElement.clientWidth;
      const h = canvas.height = canvas.parentElement.clientHeight;

      ctx.clearRect(0, 0, w, h);

      // Background Grid Lines
      ctx.strokeStyle = '#2f4553';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      const gridRows = 5;
      const gridCols = 6;
      for (let i = 1; i < gridRows; i++) {
        const y = (h / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(w - 20, y);
        ctx.stroke();
      }

      for (let j = 1; j < gridCols; j++) {
        const x = 40 + ((w - 60) / gridCols) * j;
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, h - 30);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      // Draw Rocket Curve if active or crashed
      if (gameState === 'in_progress' || gameState === 'crashed') {
        const paddingLeft = 50;
        const paddingBottom = 40;
        const graphW = w - paddingLeft - 30;
        const graphH = h - paddingBottom - 30;

        const mult = currentMultiplier;
        const progress = Math.min(1, (mult - 1) / 10); // scale visually up to 10x

        const startX = paddingLeft;
        const startY = h - paddingBottom;
        const endX = paddingLeft + graphW * Math.min(1, progress * 1.2);
        const endY = h - paddingBottom - graphH * Math.min(1, progress * 0.9);

        const controlX = startX + (endX - startX) * 0.5;
        const controlY = startY;

        // Gradient Fill under curve
        const grad = ctx.createLinearGradient(0, endY, 0, startY);
        if (gameState === 'crashed') {
          grad.addColorStop(0, 'rgba(255, 59, 92, 0.35)');
          grad.addColorStop(1, 'rgba(255, 59, 92, 0.0)');
        } else {
          grad.addColorStop(0, 'rgba(0, 231, 1, 0.35)');
          grad.addColorStop(1, 'rgba(0, 231, 1, 0.0)');
        }

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.lineTo(endX, startY);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke Curve Line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.strokeStyle = gameState === 'crashed' ? '#ff3b5c' : '#00e701';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Rocket Head Node
        ctx.beginPath();
        ctx.arc(endX, endY, 6, 0, Math.PI * 2);
        ctx.fillStyle = gameState === 'crashed' ? '#ff3b5c' : '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = gameState === 'crashed' ? '#ff3b5c' : '#00e701';
        ctx.stroke();
      }

      renderId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(renderId);
  }, [gameState, currentMultiplier]);

  const handleBetClick = () => {
    soundFX.init();
    const amount = parseFloat(betAmount);

    if (isNaN(amount) || amount <= 0) {
      setGameMessage({ type: 'error', text: 'Enter a valid bet amount.' });
      return;
    }

    if (balance < amount) {
      setGameMessage({ type: 'error', text: 'Insufficient balance!' });
      return;
    }

    setBalance((prev) => parseFloat((prev - amount).toFixed(2)));
    soundFX.playBet();

    if (gameState === 'in_progress') {
      setIsBetQueued(true);
      setGameMessage({ type: '', text: 'Bet queued for next round.' });
    } else {
      startRound(amount);
    }
  };

  const handleHalfBet = () => {
    const val = Math.max(0.1, parseFloat(betAmount || '0') / 2);
    setBetAmount(val.toFixed(2));
  };

  const handleDoubleBet = () => {
    const val = parseFloat(betAmount || '0') * 2;
    setBetAmount(val.toFixed(2));
  };

  const toggleMute = () => {
    soundFX.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#0f212e] text-white font-sans overflow-hidden select-none">
      
      {/* LEFT SIDEBAR: Controls */}
      <div className="w-full lg:w-80 bg-[#1a2c38] p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2f4553] shadow-2xl z-20 shrink-0">
        <div className="space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-[#00e701] p-1.5 rounded-lg text-black font-black text-xs tracking-wider flex items-center space-x-1">
                <TrendingUpIcon size={14} className="stroke-[3]" />
                <span>STAKE</span>
              </div>
              <span className="font-bold tracking-wide text-sm text-gray-200">CRASH</span>
            </div>
            <button 
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white bg-[#0f212e] rounded-lg border border-[#2f4553] transition"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeXIcon size={16} /> : <Volume2Icon size={16} />}
            </button>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 bg-[#0f212e] p-1 rounded-xl border border-[#2f4553]">
            <button
              onClick={() => setMode('manual')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'manual'
                  ? 'bg-[#2f4553] text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setMode('auto')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'auto'
                  ? 'bg-[#2f4553] text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Auto
            </button>
          </div>

          {/* Available Balance Display */}
          <div className="bg-[#0f212e] p-3 rounded-xl border border-[#2f4553]">
            <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center justify-between">
              <span>AVAILABLE BALANCE</span>
              <span className="text-[#00e701] text-[10px] bg-[#00e701]/10 px-1.5 py-0.5 rounded font-mono font-bold">
                LIVE
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-white flex items-center">
              <span className="text-gray-400 mr-1">$</span>
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Bet Input */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
              <span>Bet Amount</span>
              <span className="text-gray-300 font-mono">${parseFloat(betAmount || '0').toFixed(2)}</span>
            </div>

            <div className="relative flex items-center bg-[#0f212e] rounded-xl border border-[#2f4553] focus-within:border-[#00e701] transition overflow-hidden">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={betAmount}
                disabled={gameState === 'in_progress' && animState.current.placedBetAmount > 0}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-white focus:outline-none disabled:opacity-50"
                placeholder="0.00"
              />
              
              <div className="flex items-center bg-[#2f4553]/50 px-2 py-1 rounded-lg text-xs font-bold text-[#00e701] mr-1 shrink-0">
                <span className="w-4 h-4 rounded-full bg-[#00e701] text-black flex items-center justify-center text-[10px] font-black mr-1">₮</span>
                USDT
              </div>

              <div className="flex border-l border-[#2f4553] shrink-0">
                <button
                  onClick={handleHalfBet}
                  disabled={gameState === 'in_progress' && animState.current.placedBetAmount > 0}
                  className="px-2.5 py-2.5 text-xs font-bold text-gray-300 hover:bg-[#2f4553] transition disabled:opacity-50"
                >
                  ½
                </button>
                <button
                  onClick={handleDoubleBet}
                  disabled={gameState === 'in_progress' && animState.current.placedBetAmount > 0}
                  className="px-2.5 py-2.5 text-xs font-bold text-gray-300 border-l border-[#2f4553] hover:bg-[#2f4553] transition disabled:opacity-50"
                >
                  2×
                </button>
              </div>
            </div>
          </div>

          {/* Quick Bet Presets */}
          <div>
            <div className="grid grid-cols-6 gap-1.5">
              {QUICK_BET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  onClick={() => setBetAmount(val.toString())}
                  disabled={gameState === 'in_progress' && animState.current.placedBetAmount > 0}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                    parseFloat(betAmount) === val
                      ? 'bg-[#00e701] text-black border-[#00e701] shadow-lg shadow-[#00e701]/20'
                      : 'bg-[#0f212e] text-gray-300 border-[#2f4553] hover:border-gray-400'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Cashout Multiplier Input */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
              <span>Auto Cashout Target</span>
              <span className="text-[#00e701] font-mono">{parseFloat(autoCashout || '0').toFixed(2)}x</span>
            </div>
            <div className="relative flex items-center bg-[#0f212e] rounded-xl border border-[#2f4553] focus-within:border-[#00e701] transition overflow-hidden">
              <input
                type="number"
                min="1.01"
                step="0.1"
                value={autoCashout}
                onChange={(e) => setAutoCashout(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-white focus:outline-none"
                placeholder="2.00"
              />
              <span className="text-gray-400 font-bold px-3 text-sm">X</span>
            </div>
          </div>

          {/* Game Speed Control */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
              <span>Game Speed</span>
              <span className="text-[#00e701] font-mono">{gameSpeed}x</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 bg-[#0f212e] p-1 rounded-xl border border-[#2f4553]">
              {[1, 1.5, 2, 3].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setGameSpeed(spd)}
                  className={`py-1 text-xs font-bold font-mono rounded-lg transition ${
                    gameSpeed === spd
                      ? 'bg-[#00e701] text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {gameState === 'in_progress' && animState.current.placedBetAmount > 0 && !hasCashedOut ? (
            <button
              onClick={() => triggerCashout(currentMultiplier)}
              className="w-full py-4 rounded-xl font-extrabold text-base tracking-wide bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20 transition transform active:scale-98 flex flex-col items-center justify-center"
            >
              <span className="text-xs uppercase font-black tracking-wider opacity-80">Cash Out At</span>
              <span className="text-xl font-mono">${(animState.current.placedBetAmount * currentMultiplier).toFixed(2)}</span>
            </button>
          ) : (
            <button
              onClick={handleBetClick}
              disabled={gameState === 'crashed'}
              className={`w-full py-4 rounded-xl font-bold text-base tracking-wide shadow-lg transition transform active:scale-98 flex items-center justify-center space-x-2 ${
                gameState === 'crashed'
                  ? 'bg-[#2f4553] text-gray-500 cursor-not-allowed'
                  : 'bg-[#00e701] hover:bg-[#00c701] text-black shadow-[#00e701]/20'
              }`}
            >
              <FlameIcon size={20} className="fill-black" />
              <span>{gameState === 'in_progress' ? 'Queue Bet Next Round' : 'Bet (Next Round)'}</span>
            </button>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2f4553] text-[11px] text-gray-500 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[#00e701]">
            <ShieldIcon size={12} />
            <span>Provably Fair SHA-256</span>
          </div>
          <span>RTP 99.0%</span>
        </div>
      </div>

      {/* RIGHT MAIN GAME GRAPH AREA */}
      <div className="flex-1 flex flex-col justify-between p-4 lg:p-6 overflow-y-auto bg-[#0f212e] relative">
        
        {/* Multiplier History Bar */}
        <div className="flex items-center justify-between bg-[#1a2c38] p-2.5 rounded-2xl border border-[#2f4553] mb-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold shrink-0">
            <HistoryIcon size={16} className="text-[#00e701]" />
            <span className="hidden sm:inline">CRASH HISTORY:</span>
          </div>
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {history.map((mult, idx) => {
              const isHigh = mult >= 10.0;
              const isMedium = mult >= 2.0;
              return (
                <div
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs shadow shrink-0 ${
                    isHigh
                      ? 'bg-amber-400 text-black ring-2 ring-amber-300'
                      : isMedium
                      ? 'bg-[#00e701]/20 text-[#00e701] border border-[#00e701]/40'
                      : 'bg-[#ff3b5c]/10 text-[#ff3b5c] border border-[#ff3b5c]/30'
                  } ${idx === 0 ? 'scale-105 font-black' : 'opacity-80'}`}
                >
                  {mult.toFixed(2)}x
                </div>
              );
            })}
          </div>
        </div>

        {/* Rocket Curve Canvas Container */}
        <div className="flex-1 flex flex-col items-center justify-center relative rounded-3xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl overflow-hidden min-h-[380px]">
          
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Central Multiplier Overlay */}
          <div className="z-10 text-center pointer-events-none select-none">
            {gameState === 'crashed' ? (
              <div className="animate-bounce">
                <div className="text-xs uppercase tracking-widest text-[#ff3b5c] font-black mb-1">
                  CRASHED
                </div>
                <div className="text-5xl sm:text-7xl font-mono font-black text-[#ff3b5c] drop-shadow-[0_0_25px_rgba(255,59,92,0.6)]">
                  {currentMultiplier.toFixed(2)}x
                </div>
              </div>
            ) : gameState === 'in_progress' ? (
              <div>
                <div className="text-5xl sm:text-8xl font-mono font-black text-white drop-shadow-[0_0_35px_rgba(0,231,1,0.5)] tracking-tight">
                  {currentMultiplier.toFixed(2)}
                  <span className="text-3xl sm:text-5xl text-[#00e701] ml-1">x</span>
                </div>
                {hasCashedOut && (
                  <div className="mt-2 bg-[#00e701]/20 border border-[#00e701] px-4 py-1.5 rounded-full text-[#00e701] font-bold text-sm animate-pulse inline-block">
                    CASHED OUT @ {cashedOutAt?.toFixed(2)}x (+${payoutWon.toFixed(2)})
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
                  PREPARING NEXT ROUND
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-bold text-gray-300 animate-pulse">
                  1.00x
                </div>
              </div>
            )}
          </div>

          {/* Game Banner Message */}
          <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold border transition z-20 ${
            gameMessage.type === 'win'
              ? 'bg-[#00e701]/20 border-[#00e701] text-[#00e701] shadow-lg shadow-[#00e701]/20'
              : gameMessage.type === 'loss'
              ? 'bg-[#ff3b5c]/20 border-[#ff3b5c] text-[#ff3b5c]'
              : gameMessage.type === 'error'
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-[#0f212e]/90 border-[#2f4553] text-gray-300'
          }`}>
            {gameMessage.text}
          </div>

        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">Current Speed</span>
            <span className="text-xs font-mono font-bold text-[#00e701]">
              {(1 + Math.log2(currentMultiplier) * 0.5).toFixed(1)}x
            </span>
          </div>
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">Target Cashout</span>
            <span className="text-xs font-mono font-bold text-white">
              {parseFloat(autoCashout || '0').toFixed(2)}x
            </span>
          </div>
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">House Edge</span>
            <span className="text-xs font-mono font-bold text-gray-300">1.0%</span>
          </div>
        </div>

      </div>
    </div>
  );
}