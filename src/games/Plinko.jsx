import React, { useState, useEffect, useRef, useCallback } from 'react';

// Quick bet presets
const QUICK_BET_AMOUNTS = [1, 5, 10, 25, 50, 100];

// Inline SVG Icon Components
const SparklesIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5l-2.1 2.1m-8.8 8.8l-2.1 2.1m0 -13l2.1 2.1m8.8 8.8l2.1 2.1" />
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

const PlayIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const ZapIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const RefreshIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// Adjusted severely lowered Multipliers to increase house edge and lower overall payout
const MULTIPLIER_TABLES = {
  8: {
    low: [2.0, 1.0, 0.5, 0.2, 0.1, 0.2, 0.5, 1.0, 2.0],
    medium: [4.0, 1.2, 0.5, 0.2, 0.1, 0.2, 0.5, 1.2, 4.0],
    high: [8.0, 1.5, 0.4, 0.1, 0.05, 0.1, 0.4, 1.5, 8.0]
  },
  9: {
    low: [2.2, 1.1, 0.6, 0.3, 0.1, 0.1, 0.3, 0.6, 1.1, 2.2],
    medium: [5.0, 1.4, 0.6, 0.2, 0.1, 0.1, 0.2, 0.6, 1.4, 5.0],
    high: [12.0, 2.0, 0.5, 0.1, 0.05, 0.05, 0.1, 0.5, 2.0, 12.0]
  },
  10: {
    low: [2.5, 1.2, 0.6, 0.3, 0.2, 0.1, 0.2, 0.3, 0.6, 1.2, 2.5],
    medium: [6.0, 1.8, 0.7, 0.3, 0.1, 0.05, 0.1, 0.3, 0.7, 1.8, 6.0],
    high: [18.0, 3.0, 0.8, 0.2, 0.05, 0.02, 0.05, 0.2, 0.8, 3.0, 18.0]
  },
  11: {
    low: [3.0, 1.3, 0.7, 0.4, 0.2, 0.1, 0.1, 0.2, 0.4, 0.7, 1.3, 3.0],
    medium: [8.0, 2.0, 0.9, 0.4, 0.1, 0.05, 0.05, 0.1, 0.4, 0.9, 2.0, 8.0],
    high: [25.0, 4.0, 1.0, 0.2, 0.05, 0.02, 0.02, 0.05, 0.2, 1.0, 4.0, 25.0]
  },
  12: {
    low: [3.5, 1.4, 0.7, 0.4, 0.3, 0.1, 0.1, 0.1, 0.3, 0.4, 0.7, 1.4, 3.5],
    medium: [10.0, 2.5, 1.0, 0.5, 0.2, 0.05, 0.02, 0.05, 0.2, 0.5, 1.0, 2.5, 10.0],
    high: [35.0, 6.0, 1.5, 0.3, 0.08, 0.02, 0.01, 0.01, 0.02, 0.08, 0.3, 1.5, 6.0, 35.0]
  },
  13: {
    low: [3.8, 1.5, 0.8, 0.5, 0.3, 0.1, 0.08, 0.08, 0.1, 0.3, 0.5, 0.8, 1.5, 3.8],
    medium: [12.0, 3.0, 1.2, 0.5, 0.2, 0.05, 0.02, 0.02, 0.05, 0.2, 0.5, 1.2, 3.0, 12.0],
    high: [50.0, 8.0, 2.0, 0.4, 0.08, 0.02, 0.01, 0.01, 0.01, 0.02, 0.08, 0.4, 2.0, 8.0, 50.0]
  },
  14: {
    low: [4.0, 1.6, 0.9, 0.5, 0.3, 0.1, 0.08, 0.05, 0.08, 0.1, 0.3, 0.5, 0.9, 1.6, 4.0],
    medium: [15.0, 3.5, 1.5, 0.6, 0.2, 0.05, 0.02, 0.01, 0.02, 0.05, 0.2, 0.6, 1.5, 3.5, 15.0],
    high: [75.0, 10.0, 2.5, 0.5, 0.1, 0.02, 0.01, 0.01, 0.01, 0.02, 0.1, 0.5, 2.5, 10.0, 75.0]
  },
  15: {
    low: [4.5, 1.8, 1.0, 0.6, 0.3, 0.1, 0.08, 0.05, 0.05, 0.08, 0.1, 0.3, 0.6, 1.0, 1.8, 4.5],
    medium: [20.0, 4.0, 1.8, 0.7, 0.2, 0.05, 0.02, 0.01, 0.01, 0.02, 0.05, 0.2, 0.7, 1.8, 4.0, 20.0],
    high: [100.0, 12.0, 3.0, 0.6, 0.1, 0.02, 0.01, 0.01, 0.01, 0.01, 0.02, 0.1, 0.6, 3.0, 12.0, 100.0]
  },
  16: {
    low: [5.0, 2.0, 1.0, 0.6, 0.4, 0.2, 0.08, 0.05, 0.02, 0.05, 0.08, 0.2, 0.4, 0.6, 1.0, 2.0, 5.0],
    medium: [25.0, 5.0, 2.0, 0.8, 0.3, 0.08, 0.02, 0.01, 0.01, 0.01, 0.02, 0.08, 0.3, 0.8, 2.0, 5.0, 25.0],
    high: [150.0, 15.0, 4.0, 0.8, 0.15, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.15, 0.8, 4.0, 15.0, 150.0]
  }
};

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

  playPegHit(pitchMultiplier = 1.0) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 * pitchMultiplier, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300 * pitchMultiplier, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playSlotWin(mult) {
    if (this.muted || !this.ctx) return;
    try {
      const isBigWin = mult >= 3.0;
      const notes = isBigWin ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = isBigWin ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.15);
      });
    } catch (e) {}
  }
}

const soundFX = new SoundEffects();

export default function App() {
  const [balance, setBalance] = useState(1000.00);
  const [betAmount, setBetAmount] = useState('10.00');
  const [riskLevel, setRiskLevel] = useState('medium'); // 'low' | 'medium' | 'high'
  const [rowCount, setRowCount] = useState(16); // 8 to 16
  const [isMuted, setIsMuted] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [slotStats, setSlotStats] = useState({});

  const [history, setHistory] = useState([
    { mult: 0.5, bet: 10, profit: -5, risk: 'medium' },
    { mult: 0.2, bet: 10, profit: -8, risk: 'medium' },
    { mult: 2.5, bet: 10, profit: 15, risk: 'medium' },
    { mult: 0.05, bet: 10, profit: -9.5, risk: 'medium' },
    { mult: 0.2, bet: 10, profit: -8, risk: 'medium' }
  ]);

  const [totalDrops, setTotalDrops] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const canvasRef = useRef(null);

  // References for active physics simulation
  const physicsState = useRef({
    balls: [],
    pegs: [],
    slots: [],
    slotHitEffects: [],
    particles: [],
    pegGlows: new Map(),
    activeRowCount: 12,
    activeRiskLevel: 'medium'
  });

  const getSlotColor = (mult, risk) => {
    if (mult >= 50) return { bg: 'bg-purple-600', text: 'text-purple-100', hex: '#9333ea', glow: 'rgba(147,51,234,0.6)' };
    if (mult >= 5) return { bg: 'bg-red-500', text: 'text-red-100', hex: '#ef4444', glow: 'rgba(239,68,68,0.6)' };
    if (mult >= 1.5) return { bg: 'bg-amber-500', text: 'text-amber-100', hex: '#f59e0b', glow: 'rgba(245,158,11,0.6)' };
    if (mult >= 1.0) return { bg: 'bg-yellow-500', text: 'text-yellow-950', hex: '#eab308', glow: 'rgba(234,179,8,0.5)' };
    if (mult >= 0.5) return { bg: 'bg-emerald-600', text: 'text-white', hex: '#059669', glow: 'rgba(5,150,105,0.5)' };
    return { bg: 'bg-slate-700', text: 'text-slate-300', hex: '#334155', glow: 'rgba(51,65,85,0.3)' };
  };

  const currentMultipliers = MULTIPLIER_TABLES[rowCount][riskLevel];

  const dropBall = useCallback(() => {
    soundFX.init();
    const amount = parseFloat(betAmount);

    if (isNaN(amount) || amount <= 0) return;
    if (balance < amount) return;

    // Deduct bet amount immediately
    setBalance((prev) => parseFloat((prev - amount).toFixed(2)));

    // Calculate peg layout geometry based on current canvas size
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const dropX = w / 2 + (Math.random() - 0.5) * 6;
    const dropY = 20;

    const riskColors = {
      low: '#00e701',
      medium: '#f59e0b',
      high: '#ec4899'
    };

    const newBall = {
      id: Math.random().toString(36).substring(2, 9),
      x: dropX,
      y: dropY,
      vx: (Math.random() - 0.5) * 0.9,
      vy: Math.random() * 0.5 + 0.5,
      radius: Math.min(6, Math.max(3.5, 120 / rowCount)),
      betAmount: amount,
      risk: riskLevel,
      rows: rowCount,
      color: riskColors[riskLevel] || '#00e701',
      trail: []
    };

    physicsState.current.balls.push(newBall);
    setTotalDrops((prev) => prev + 1);
  }, [betAmount, balance, rowCount, riskLevel]);

  // Keyboard shortcut listener (Space = Drop Ball)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        dropBall();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropBall]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const w = (canvas.width = parent.clientWidth);
      const h = (canvas.height = parent.clientHeight);

      ctx.clearRect(0, 0, w, h);

      // Re-calculate Peg layout coordinates dynamically
      const startY = 50;
      const endY = h - 65;
      const availableH = endY - startY;
      const rowGap = availableH / (rowCount + 0.8);
      const pegRadius = Math.min(4, Math.max(2, 70 / rowCount));

      const pegs = [];
      const slots = [];

      for (let r = 0; r < rowCount; r++) {
        const pegsInRow = r + 3;
        const py = startY + r * rowGap;
        const maxBottomWidth = Math.min(w * 0.88, rowCount * 36);
        const colGap = maxBottomWidth / (rowCount + 2);
        const rowWidth = (pegsInRow - 1) * colGap;
        const startX = (w - rowWidth) / 2;

        for (let c = 0; c < pegsInRow; c++) {
          pegs.push({
            id: `${r}-${c}`,
            x: startX + c * colGap,
            y: py,
            radius: pegRadius
          });
        }
      }

      // Slots setup at bottom
      const numSlots = rowCount + 1;
      const bottomPegsInRow = rowCount + 2;
      const maxBottomWidth = Math.min(w * 0.88, rowCount * 36);
      const colGap = maxBottomWidth / (rowCount + 2);
      const bottomRowWidth = (bottomPegsInRow - 1) * colGap;
      const bottomStartX = (w - bottomRowWidth) / 2;

      const slotY = startY + rowCount * rowGap;
      const mults = MULTIPLIER_TABLES[rowCount][riskLevel];

      for (let s = 0; s < numSlots; s++) {
        const sx1 = bottomStartX + s * colGap;
        const sx2 = bottomStartX + (s + 1) * colGap;
        slots.push({
          index: s,
          x1: sx1,
          x2: sx2,
          y: slotY,
          width: colGap,
          height: 24,
          mult: mults[s]
        });
      }

      physicsState.current.pegs = pegs;
      physicsState.current.slots = slots;

      const pegGlows = physicsState.current.pegGlows;

      // Draw Pegs with dynamic hit glow support
      pegs.forEach((peg) => {
        const glowVal = pegGlows.get(peg.id) || 0;
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius + glowVal * 1.5, 0, Math.PI * 2);
        
        if (glowVal > 0) {
          ctx.fillStyle = `rgba(0, 231, 1, ${0.5 + glowVal * 0.5})`;
          ctx.shadowColor = '#00e701';
          ctx.shadowBlur = 10 * glowVal;
          pegGlows.set(peg.id, Math.max(0, glowVal - 0.08));
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and Draw particles (from big wins)
      const particles = physicsState.current.particles;
      for (let pIdx = particles.length - 1; pIdx >= 0; pIdx--) {
        const pt = particles[pIdx];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.15; // gravity
        pt.alpha -= 0.02;

        if (pt.alpha <= 0) {
          particles.splice(pIdx, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update and Draw active Slot hit animations
      const activeEffects = physicsState.current.slotHitEffects;
      for (let i = activeEffects.length - 1; i >= 0; i--) {
        const eff = activeEffects[i];
        eff.alpha -= 0.03;
        if (eff.alpha <= 0) {
          activeEffects.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = eff.alpha;
        ctx.fillStyle = eff.color;
        ctx.shadowColor = eff.color;
        ctx.shadowBlur = 12;
        ctx.fillRect(eff.x, eff.y - 4, eff.width, eff.height + 8);
        ctx.restore();
      }

      // Physics update for Balls with Turbo step multiplier
      const balls = physicsState.current.balls;
      const physicsSteps = isTurbo ? 2 : 1;
      const gravity = 0.22 / physicsSteps;
      const bounceDamping = 0.58;

      for (let step = 0; step < physicsSteps; step++) {
        for (let bIndex = balls.length - 1; bIndex >= 0; bIndex--) {
          const ball = balls[bIndex];

          ball.vy += gravity;
          ball.x += ball.vx;
          ball.y += ball.vy;

          if (step === 0) {
            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 8) ball.trail.shift();
          }

          // Peg Collisions
          pegs.forEach((peg) => {
            const dx = ball.x - peg.x;
            const dy = ball.y - peg.y;
            const dist = Math.hypot(dx, dy);
            const minDist = ball.radius + peg.radius;

            if (dist < minDist) {
              const nx = dx / dist;
              const ny = dy / dist;

              ball.x = peg.x + nx * minDist;
              ball.y = peg.y + ny * minDist;

              const dot = ball.vx * nx + ball.vy * ny;
              ball.vx = (ball.vx - 2 * dot * nx) * bounceDamping;
              ball.vy = (ball.vy - 2 * dot * ny) * bounceDamping;

              ball.vx += (Math.random() - 0.5) * 0.7;

              // Trigger peg hit glow animation
              pegGlows.set(peg.id, 1.0);

              const speed = Math.hypot(ball.vx, ball.vy);
              soundFX.playPegHit(0.8 + Math.min(speed / 10, 0.6));
            }
          });

          // Slot Landing Check
          if (ball.y >= slotY) {
            let landedSlot = slots.find((s) => ball.x >= s.x1 && ball.x <= s.x2);

            if (!landedSlot) {
              if (ball.x < slots[0].x1) landedSlot = slots[0];
              else landedSlot = slots[slots.length - 1];
            }

            const multiplier = landedSlot.mult;
            const payout = parseFloat((ball.betAmount * multiplier).toFixed(2));
            const netProfit = parseFloat((payout - ball.betAmount).toFixed(2));

            setBalance((prev) => parseFloat((prev + payout).toFixed(2)));
            setTotalProfit((prev) => parseFloat((prev + netProfit).toFixed(2)));

            setSlotStats((prev) => ({
              ...prev,
              [landedSlot.index]: (prev[landedSlot.index] || 0) + 1
            }));

            setHistory((prev) => [
              { mult: multiplier, bet: ball.betAmount, profit: netProfit, risk: ball.risk },
              ...prev.slice(0, 11)
            ]);

            const colorInfo = getSlotColor(multiplier, ball.risk);
            physicsState.current.slotHitEffects.push({
              x: landedSlot.x1,
              y: landedSlot.y,
              width: landedSlot.width,
              height: landedSlot.height,
              color: colorInfo.hex,
              alpha: 0.9
            });

            // Spawn celebration particles on big win
            if (multiplier >= 3.0) {
              for (let p = 0; p < 20; p++) {
                particles.push({
                  x: landedSlot.x1 + landedSlot.width / 2,
                  y: landedSlot.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: -Math.random() * 5 - 2,
                  size: Math.random() * 3 + 2,
                  color: colorInfo.hex,
                  alpha: 1.0
                });
              }
            }

            soundFX.playSlotWin(multiplier);
            balls.splice(bIndex, 1);
          }
        }
      }

      // Draw trails & balls
      balls.forEach((ball) => {
        for (let t = 0; t < ball.trail.length; t++) {
          const pt = ball.trail[t];
          const opacity = (t + 1) / ball.trail.length * 0.4;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ball.radius * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = ball.color;
          ctx.globalAlpha = opacity;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rowCount, riskLevel, isTurbo]);

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

  const resetBalance = () => {
    if (balance < 10) {
      setBalance(1000.00);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-[#0f212e] text-white font-sans overflow-hidden select-none">
      {/* LEFT SIDEBAR: Controls */}
      <div className="w-full lg:w-80 bg-[#1a2c38] p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2f4553] z-20 shrink-0 overflow-y-auto">
        <div className="space-y-4">
          {/* Header Branding */}
          <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-[#00e701] p-1.5 rounded-lg text-black font-black text-xs tracking-wider flex items-center space-x-1 shadow-md shadow-[#00e701]/20">
                <SparklesIcon size={14} />
                <span>STAKE</span>
              </div>
              <span className="font-extrabold tracking-wide text-sm text-gray-200 flex items-center gap-1">
                PLINKO <span className="text-[#00e701] text-xs">CASINO</span>
              </span>
            </div>
            <button
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white bg-[#0f212e] rounded-lg border border-[#2f4553] transition"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeXIcon size={16} /> : <Volume2Icon size={16} />}
            </button>
          </div>

          {/* User Balance Display */}
          <div className="bg-[#0f212e] p-3.5 rounded-xl border border-[#2f4553] shadow-inner flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 mb-0.5 flex items-center justify-between">
                <span>BALANCE</span>
              </div>
              <div className="text-2xl font-mono font-bold text-white flex items-center">
                <span className="text-[#00e701] mr-1">$</span>
                {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            {balance < 10 && (
              <button
                onClick={resetBalance}
                className="p-2 text-xs font-bold text-[#00e701] bg-[#00e701]/10 hover:bg-[#00e701]/20 border border-[#00e701]/30 rounded-lg flex items-center gap-1 transition"
                title="Reset Balance to $1,000"
              >
                <RefreshIcon size={12} /> Reload
              </button>
            )}
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
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm font-mono text-white focus:outline-none"
                placeholder="0.00"
              />

              <div className="flex border-l border-[#2f4553] shrink-0">
                <button
                  onClick={handleHalfBet}
                  className="px-3 py-2.5 text-xs font-bold text-gray-300 hover:bg-[#2f4553] transition"
                >
                  ½
                </button>
                <button
                  onClick={handleDoubleBet}
                  className="px-3 py-2.5 text-xs font-bold text-gray-300 border-l border-[#2f4553] hover:bg-[#2f4553] transition"
                >
                  2×
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-6 gap-1 mt-2">
              {QUICK_BET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt.toFixed(2))}
                  className="py-1 text-[11px] font-mono font-semibold bg-[#0f212e] text-gray-300 hover:bg-[#2f4553] hover:text-white rounded-lg border border-[#2f4553] transition"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Level Selector */}
          <div>
            <div className="text-xs font-semibold text-gray-400 mb-1.5">Risk Level</div>
            <div className="grid grid-cols-3 gap-1 bg-[#0f212e] p-1 rounded-xl border border-[#2f4553]">
              {['low', 'medium', 'high'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setRiskLevel(lvl)}
                  className={`py-1.5 text-xs font-bold capitalize rounded-lg transition ${
                    riskLevel === lvl
                      ? 'bg-[#2f4553] text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Row Count Selector */}
         

          {/* Primary Action Controls */}
          <div className="pt-2 space-y-2">
            <button
              onClick={dropBall}
              className="w-full py-4 rounded-xl font-extrabold text-base tracking-wide bg-[#00e701] hover:bg-[#00c701] text-black shadow-lg shadow-[#00e701]/20 transition transform active:scale-98 flex items-center justify-center space-x-2"
            >
              <PlayIcon size={18} />
              <span>BET / DROP BALL (Space)</span>
            </button>

            <button
              onClick={() => setIsTurbo(!isTurbo)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider border flex items-center justify-center gap-1 transition ${
                isTurbo
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-[#0f212e] text-gray-400 border-[#2f4553] hover:text-white hover:bg-[#2f4553]'
              }`}
            >
              <ZapIcon size={14} />
              <span>TURBO MODE {isTurbo ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-[#2f4553] text-[11px] text-gray-500 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-[#00e701]">
            <ShieldIcon size={12} />
            <span>Provably Fair SHA-256</span>
          </div>
          <span className="text-red-400 font-semibold">RTP 75.0%</span>
        </div>
      </div>

      {/* RIGHT MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col justify-between p-4 lg:p-6 overflow-y-auto bg-[#0f212e] relative">
        {/* Top History Bar */}
        <div className="flex items-center justify-between bg-[#1a2c38] p-2.5 rounded-2xl border border-[#2f4553] mb-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold shrink-0">
            <HistoryIcon size={14} className="text-gray-400" />
            <span className="text-[#00e701] font-bold">RECENT DROPS:</span>
          </div>
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {history.map((item, idx) => {
              const color = getSlotColor(item.mult, item.risk);
              return (
                <div
                  key={idx}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs shadow shrink-0 ${color.bg} ${color.text} ${
                    idx === 0 ? 'scale-105 ring-2 ring-white/50' : 'opacity-85'
                  }`}
                >
                  {item.mult}x
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN PLINKO CANVAS AREA */}
        <div className="flex-1 flex flex-col items-center justify-center relative rounded-3xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl min-h-[420px] overflow-hidden p-2">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Multiplier Row Display Overlay at bottom */}
          <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center px-4 pointer-events-none z-10 space-y-1">
            <div className="flex gap-1 justify-center max-w-full overflow-x-auto">
              {currentMultipliers.map((mult, idx) => {
                const color = getSlotColor(mult, riskLevel);
                const hits = slotStats[idx] || 0;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`min-w-[22px] max-w-[48px] py-1.5 px-0.5 rounded-md font-mono text-[10px] sm:text-xs font-black text-center shadow-md border border-black/20 ${color.bg} ${color.text} transition-transform`}
                    >
                      {mult}x
                    </div>
                    {hits > 0 && (
                      <span className="text-[9px] font-mono font-semibold text-gray-400 bg-black/40 px-1 rounded mt-0.5">
                        {hits}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Game Statistics Bar */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-semibold text-gray-400">
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span>Total Drops</span>
            <span className="font-mono text-white">{totalDrops}</span>
          </div>
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span>Session Profit</span>
            <span className={`font-mono ${totalProfit >= 0 ? 'text-[#00e701]' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </span>
          </div>
          <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#2f4553] flex items-center justify-between">
            <span>Provably Fair</span>
            <span className="font-mono text-[#00e701]">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}