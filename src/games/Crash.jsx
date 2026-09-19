import React, { useState, useEffect, useRef, useCallback } from 'react';

// Inline SVG Icon Components (prevents React element $$typeof instance mismatch errors)
const Volume2Icon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const VolumeXIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </svg>
);

const ShieldIcon = ({ size = 12, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TrendingUpIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const HistoryIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const FlameIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

/* =========================================================================
 * AUDIO SYSTEM (Web Audio API Synthesizer - Standalone React Compatible)
 * ========================================================================= */
class SoundFX {
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

  playBet() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playTick(multiplier) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const freq = Math.min(1800, 300 + Math.log2(multiplier) * 250);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playWin() {
    if (this.muted || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.35);
      });
    } catch (e) {}
  }

  playCrash() {
    if (this.muted || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }
}

const soundFX = new SoundFX();
const QUICK_BET_AMOUNTS = [1, 5, 10, 25, 100, 500];

export default function App() {
  /* =========================================================================
   * BACKEND INTEGRATION STATES & API HANDLER SCAFFOLDING (COMMENTED OUT)
   * ========================================================================= */
  /*
  const [userBalance, setUserBalance] = useState(1000.00);
  const [activeRoundId, setActiveRoundId] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch('/api/crash/user-data');
        const data = await res.json();
        setUserBalance(data.balance);
      } catch (err) {
        console.error('Failed to load user balance from API:', err);
      }
    }
    fetchUserData();
  }, []);

  const sendBetToBackend = async (amount, autoCashoutValue) => {
    try {
      const response = await fetch('/api/crash/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          betAmount: amount,
          autoCashout: autoCashoutValue || null
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setGameMessage({ type: 'error', text: data.message || 'Bet placement failed.' });
        return false;
      }

      setUserBalance(data.newBalance);
      setActiveRoundId(data.roundId);
      return true;
    } catch (err) {
      console.error('API Bet Error:', err);
      return false;
    }
  };

  const sendCashoutToBackend = async (currentMultiplier) => {
    try {
      const response = await fetch('/api/crash/cashout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          roundId: activeRoundId,
          multiplier: currentMultiplier
        })
      });

      const data = await response.json();
      if (data.success) {
        setUserBalance(data.updatedBalance);
        return { success: true, payout: data.payoutAmount };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('API Cashout Error:', err);
      return { success: false };
    }
  };
  */

  // Frontend Local Game States
  const [balance, setBalance] = useState(1000.00);
  const [betAmount, setBetAmount] = useState('10.00');
  const [autoCashout, setAutoCashout] = useState('2.00');
  const [mode, setMode] = useState('manual');
  
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'in_progress' | 'crashed'
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(0);
  const [isBetQueued, setIsBetQueued] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashedOutAt, setCashedOutAt] = useState(null);
  const [payoutWon, setPayoutWon] = useState(0);

  const [history, setHistory] = useState([1.42, 2.15, 1.08, 14.82, 1.95, 3.40, 1.12, 8.50, 2.04]);
  const [gameMessage, setGameMessage] = useState({ type: '', text: 'Place your bet to join next round!' });
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef(null);

  // Animation Engine Refs
  const animState = useRef({
    startTime: 0,
    elapsed: 0,
    multiplier: 1.00,
    crashTarget: 1.00,
    running: false,
    crashed: false,
    particles: [],
    stars: [],
    hasCashedOutRef: false,
    autoCashoutRef: 2.00,
    placedBetAmount: 0
  });

  const toggleMute = () => {
    soundFX.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const initStars = (width, height) => {
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.8 + 0.2
      });
    }
    return stars;
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const state = animState.current;

    ctx.clearRect(0, 0, width, height);

    // 1. Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a1723');
    bgGrad.addColorStop(1, '#0f212e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Animated Starfield Particles
    if (!state.stars || state.stars.length === 0) {
      state.stars = initStars(width, height);
    }

    ctx.fillStyle = '#ffffff';
    state.stars.forEach((star) => {
      ctx.save();
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (state.running) {
        star.x -= star.speed * (1 + Math.log2(state.multiplier) * 0.5);
        star.y += star.speed * 0.5;
        if (star.x < 0) star.x = width;
        if (star.y > height) star.y = 0;
      }
    });

    // 3. Grid Lines
    const paddingLeft = 50;
    const paddingBottom = 40;
    const graphWidth = width - paddingLeft - 20;
    const graphHeight = height - paddingBottom - 30;

    ctx.strokeStyle = '#1e3344';
    ctx.lineWidth = 1;

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = height - paddingBottom - (graphHeight / ySteps) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();

      const val = 1 + ((Math.max(state.multiplier, 2.0) - 1) / ySteps) * i;
      ctx.fillStyle = '#557086';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${val.toFixed(1)}x`, paddingLeft - 8, y + 3);
    }

    // Vertical Axis Base Line
    ctx.strokeStyle = '#2f4553';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, 20);
    ctx.lineTo(paddingLeft, height - paddingBottom);
    ctx.lineTo(width - 10, height - paddingBottom);
    ctx.stroke();

    if (!state.running && !state.crashed) {
      return;
    }

    // 4. Rocket Curve Calculations
    const maxMultScale = Math.max(2.0, state.multiplier);
    const progressX = Math.min(1.0, state.elapsed / 12000);
    const rocketX = paddingLeft + graphWidth * Math.min(progressX, 0.9);
    
    const normY = (state.multiplier - 1) / (maxMultScale - 1);
    const rocketY = (height - paddingBottom) - graphHeight * Math.min(normY, 0.88);

    const controlX = paddingLeft + (rocketX - paddingLeft) * 0.4;
    const controlY = height - paddingBottom;

    // 5. Draw Glowing Gradient Under Curve
    const areaGrad = ctx.createLinearGradient(0, rocketY, 0, height - paddingBottom);
    if (state.crashed) {
      areaGrad.addColorStop(0, 'rgba(255, 61, 92, 0.35)');
      areaGrad.addColorStop(1, 'rgba(255, 61, 92, 0.0)');
    } else {
      areaGrad.addColorStop(0, 'rgba(0, 231, 1, 0.35)');
      areaGrad.addColorStop(1, 'rgba(0, 231, 1, 0.0)');
    }

    ctx.beginPath();
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.quadraticCurveTo(controlX, controlY, rocketX, rocketY);
    ctx.lineTo(rocketX, height - paddingBottom);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // 6. Main Curve Stroke
    ctx.beginPath();
    ctx.moveTo(paddingLeft, height - paddingBottom);
    ctx.quadraticCurveTo(controlX, controlY, rocketX, rocketY);
    ctx.strokeStyle = state.crashed ? '#ff3b5c' : '#00e701';
    ctx.lineWidth = 4;
    ctx.shadowColor = state.crashed ? '#ff3b5c' : '#00e701';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 7. Rocket / Jet Trail Particles
    if (state.running && !state.crashed) {
      for (let p = 0; p < 3; p++) {
        state.particles.push({
          x: rocketX - 5 + (Math.random() * 6 - 3),
          y: rocketY + 5 + (Math.random() * 6 - 3),
          vx: -Math.random() * 3 - 1,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 4 + 2,
          life: 1.0,
          color: Math.random() > 0.5 ? '#00e701' : '#ffe875'
        });
      }
    }

    state.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
    });
    state.particles = state.particles.filter((p) => p.life > 0);

    // 8. Explosion Particles on Crash
    if (state.crashed) {
      if (state.particles.length < 20 && Math.random() < 0.3) {
        state.particles.push({
          x: rocketX,
          y: rocketY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: Math.random() * 6 + 3,
          life: 1.0,
          color: '#ff3b5c'
        });
      }
    }

    // 9. Rocket Head Indicator
    if (!state.crashed) {
      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e701';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.fillStyle = '#ff3b5c';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', 0, 0);
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    let animId;

    const animate = (timestamp) => {
      const state = animState.current;

      if (state.running) {
        if (!state.startTime) state.startTime = timestamp;
        state.elapsed = timestamp - state.startTime;

        const newMultiplier = parseFloat(Math.max(1.00, Math.exp(0.00055 * state.elapsed)).toFixed(2));
        state.multiplier = newMultiplier;
        setCurrentMultiplier(newMultiplier);

        if (Math.floor(newMultiplier * 10) % 2 === 0) {
          soundFX.playTick(newMultiplier);
        }

        if (
          !state.hasCashedOutRef &&
          state.placedBetAmount > 0 &&
          state.autoCashoutRef &&
          newMultiplier >= state.autoCashoutRef
        ) {
          triggerCashout(newMultiplier);
        }

        if (newMultiplier >= state.crashTarget) {
          state.running = false;
          state.crashed = true;
          state.multiplier = state.crashTarget;
          setCurrentMultiplier(state.crashTarget);

          setGameState('crashed');
          setHistory((prev) => [state.crashTarget, ...prev.slice(0, 11)]);
          soundFX.playCrash();

          if (!state.hasCashedOutRef && state.placedBetAmount > 0) {
            setGameMessage({ type: 'loss', text: `Crashed @ ${state.crashTarget.toFixed(2)}x. Bet lost!` });
          }

          setTimeout(() => {
            setGameState('idle');
            setHasCashedOut(false);
            setCashedOutAt(null);
            setPayoutWon(0);
            animState.current.running = false;
            animState.current.crashed = false;
            animState.current.placedBetAmount = 0;
            setGameMessage({ type: '', text: 'Place your bet for the next round!' });
          }, 3200);
        }
      }

      drawCanvas();
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [drawCanvas]);

  // Canvas Responsive Resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawCanvas();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  const startRound = (amountToBet) => {
    soundFX.init();
    
    const rand = Math.random();
    let calculatedCrash = 1.00;
    if (rand > 0.03) {
      calculatedCrash = parseFloat((0.99 / (1 - rand)).toFixed(2));
      calculatedCrash = Math.min(calculatedCrash, 1000.0);
    }

    setCrashPoint(calculatedCrash);
    setCurrentMultiplier(1.00);
    setHasCashedOut(false);
    setCashedOutAt(null);
    setGameState('in_progress');
    setGameMessage({ type: '', text: 'Rocket launched! Cash out before it crashes!' });

    animState.current.startTime = 0;
    animState.current.elapsed = 0;
    animState.current.multiplier = 1.00;
    animState.current.crashTarget = calculatedCrash;
    animState.current.running = true;
    animState.current.crashed = false;
    animState.current.particles = [];
    animState.current.hasCashedOutRef = false;
    animState.current.placedBetAmount = amountToBet;
    animState.current.autoCashoutRef = parseFloat(autoCashout) || 0;
  };

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

  const triggerCashout = (multiplierAtCashout) => {
    if (hasCashedOut || gameState !== 'in_progress') return;

    const winMult = multiplierAtCashout || currentMultiplier;
    const betVal = animState.current.placedBetAmount;
    const totalWin = parseFloat((betVal * winMult).toFixed(2));

    setHasCashedOut(true);
    setCashedOutAt(winMult);
    setPayoutWon(totalWin);
    setBalance((prev) => parseFloat((prev + totalWin).toFixed(2)));

    animState.current.hasCashedOutRef = true;
    soundFX.playWin();

    setGameMessage({
      type: 'win',
      text: `CASHED OUT @ ${winMult.toFixed(2)}x! Won $${totalWin.toFixed(2)}`
    });
  };

  const handleHalfBet = () => {
    const val = Math.max(0.1, parseFloat(betAmount || '0') / 2);
    setBetAmount(val.toFixed(2));
  };

  const handleDoubleBet = () => {
    const val = parseFloat(betAmount || '0') * 2;
    setBetAmount(val.toFixed(2));
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#0f212e] text-white font-sans overflow-hidden select-none">
      
      {/* LEFT SIDEBAR: Betting Controls */}
      <div className="w-full lg:w-80 bg-[#1a2c38] p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2f4553] shadow-2xl z-20 shrink-0">
        <div className="space-y-4">
          
          {/* Header & Sound Toggle */}
          <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-[#00e701] p-1.5 rounded-lg text-black font-black text-xs tracking-wider flex items-center space-x-1">
                <TrendingUpIcon size={14} className="stroke-[3]" />
                <span>SNACK</span>
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

          {/* Mode Selector Tabs */}
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

          {/* User Available Balance Display */}
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

          {/* Bet Amount Input Field */}
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

          {/* Dynamic Main Action Button: BET vs CASHOUT */}
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

        {/* Footer Provably Fair Badge */}
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
        
        {/* Top Multiplier History Bar */}
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

        {/* Center Rocket Curve Canvas Container */}
        <div className="flex-1 flex flex-col items-center justify-center relative rounded-3xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl overflow-hidden min-h-[380px]">
          
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Central Live Multiplier HUD Overlay */}
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

          {/* Dynamic Floating Banner Messages */}
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

        {/* Live Round Statistics Footer */}
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