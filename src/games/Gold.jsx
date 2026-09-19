import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// 1. WEB AUDIO API SOUND SYNTHESIZER
// ==========================================
class CaseSoundSynth {
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

  playClick() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  playTick(pitchMult = 1.0) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900 * pitchMult, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.012);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.012);
    } catch (e) {}
  }

  playLandStandard() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playGoldJackpot() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Explosive fanfare sequence (Golden Chord Ramp)
      const freqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        gain.gain.setValueAtTime(0.15, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.8);
      });
    } catch (e) {}
  }
}

const audioSynth = new CaseSoundSynth();

// ==========================================
// 2. SKINS & GOLD MULTIPLIERS DATABASE
// ==========================================
const RARITY_COLORS = {
  mil_spec: { label: 'Mil-Spec', color: '#4b69ff', bg: 'rgba(75, 105, 255, 0.15)', border: '#4b69ff' },
  restricted: { label: 'Restricted', color: '#8847ff', bg: 'rgba(136, 71, 255, 0.15)', border: '#8847ff' },
  classified: { label: 'Classified', color: '#d32ce6', bg: 'rgba(211, 44, 230, 0.15)', border: '#d32ce6' },
  covert: { label: 'Covert', color: '#eb4b4b', bg: 'rgba(235, 75, 75, 0.15)', border: '#eb4b4b' },
  gold: { label: '★ GOLD MULTIPLIER ★', color: '#ffd700', bg: 'rgba(255, 215, 0, 0.25)', border: '#ffd700' },
};

const ITEMS_DATABASE = [
  // Mil-Spec (Blue)
  { id: 'm1', name: 'AK-47 | Safari Mesh', category: 'mil_spec', mult: 0.2, icon: '🔫' },
  { id: 'm2', name: 'USP-S | Cyrex', category: 'mil_spec', mult: 0.5, icon: '🔫' },
  { id: 'm3', name: 'M4A4 | Evil Daimyo', category: 'mil_spec', mult: 0.8, icon: '🔫' },
  { id: 'm4', name: 'Glock-18 | Oxide Blaze', category: 'mil_spec', mult: 0.9, icon: '🔫' },

  // Restricted (Purple)
  { id: 'r1', name: 'AWP | Atheris', category: 'restricted', mult: 1.8, icon: '🎯' },
  { id: 'r2', name: 'Desert Eagle | Code Red', category: 'restricted', mult: 2.5, icon: '💥' },
  { id: 'r3', name: 'MP7 | Bloodsport', category: 'restricted', mult: 3.2, icon: '🔫' },

  // Classified (Pink)
  { id: 'c1', name: 'AK-47 | Redline', category: 'classified', mult: 6.0, icon: '🔥' },
  { id: 'c2', name: 'M4A1-S | Hyper Beast', category: 'classified', mult: 12.0, icon: '🐉' },
  { id: 'c3', name: 'USP-S | Kill Confirmed', category: 'classified', mult: 20.0, icon: '💀' },

  // Covert (Red)
  { id: 'v1', name: 'AK-47 | Fire Serpent', category: 'covert', mult: 45.0, icon: '🐍' },
  { id: 'v2', name: 'AWP | Dragon Lore', category: 'covert', mult: 100.0, icon: '🐉' },
  { id: 'v3', name: 'M4A4 | Howl', category: 'covert', mult: 250.0, icon: '🐺' },

  // ★ GOLD MULTIPLIERS (Special Multiplier Drops)
  { id: 'g10', name: '🌟 GOLD MULTIPLIER x10', category: 'gold', mult: 10.0, isGold: true, goldType: '10x', icon: '👑' },
  { id: 'g100', name: '🌟 GOLD MULTIPLIER x100', category: 'gold', mult: 100.0, isGold: true, goldType: '100x', icon: '💰' },
  { id: 'g1000', name: '👑 GOLD JACKPOT x1000', category: 'gold', mult: 1000.0, isGold: true, goldType: '1000x', icon: '⚡' },
  { id: 'g10000', name: '✨ LEGENDARY GOLD x10000', category: 'gold', mult: 10000.0, isGold: true, goldType: '10000x', icon: '🏆' },
];

const CASE_TIERS = [
  {
    id: 'standard',
    name: 'CS2 Standard Case',
    price: 5.0,
    badge: 'Popular',
    desc: 'Balanced drops with up to Gold x100',
    weights: { mil_spec: 65, restricted: 22, classified: 9, covert: 3.5, gold: 0.5 },
    goldPool: ['g10', 'g100'],
  },
  {
    id: 'classified_case',
    name: 'Classified & Gold Case',
    price: 25.0,
    badge: 'High Win',
    desc: 'High pink/red skin rates & Gold x1000',
    weights: { mil_spec: 40, restricted: 35, classified: 18, covert: 5.5, gold: 1.5 },
    goldPool: ['g10', 'g100', 'g1000'],
  },
  {
    id: 'gold_frenzy',
    name: '👑 GOLD GOD CASE',
    price: 100.0,
    badge: '🔥 10,000x MAX',
    desc: 'Maximum chance for LEGENDARY GOLD x10,000',
    weights: { mil_spec: 15, restricted: 35, classified: 30, covert: 15.0, gold: 5.0 },
    goldPool: ['g10', 'g100', 'g1000', 'g10000'],
  },
];

// Provably Fair Outcome Generator
const getRandomItemForCase = (caseObj) => {
  const rand = Math.random() * 100;
  let cum = 0;
  let chosenCategory = 'mil_spec';

  for (const [cat, weight] of Object.entries(caseObj.weights)) {
    cum += weight;
    if (rand <= cum) {
      chosenCategory = cat;
      break;
    }
  }

  let candidates = ITEMS_DATABASE.filter((item) => item.category === chosenCategory);

  if (chosenCategory === 'gold') {
    candidates = candidates.filter((item) => caseObj.goldPool.includes(item.id));
    if (candidates.length === 0) candidates = ITEMS_DATABASE.filter((i) => i.id === 'g10');
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...selected, instanceId: Math.random().toString(36).substring(2, 9) };
};

export default function App() {
  // Financial State
  const [balance, setBalance] = useState(1000.0);
  const [selectedCase, setSelectedCase] = useState(CASE_TIERS[0]);
  const [betMultiplier, setBetMultiplier] = useState(1); // 1x, 2x, 5x, 10x
  const [turboMode, setTurboMode] = useState(false);

  // Game Engine State
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'spinning' | 'won'
  const [isMuted, setIsMuted] = useState(false);
  const [unboxedItem, setUnboxedItem] = useState(null);
  const [isGoldAnimationActive, setIsGoldAnimationActive] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);

  // User Inventory & Recent History
  const [inventory, setInventory] = useState([]);
  const [recentOutcomes, setRecentOutcomes] = useState([
    ITEMS_DATABASE[0],
    ITEMS_DATABASE[4],
    ITEMS_DATABASE[12], // Gold 10x
    ITEMS_DATABASE[7],
    ITEMS_DATABASE[1],
  ]);

  // Session Metrics
  const [totalOpened, setTotalOpened] = useState(0);
  const [sessionNetProfit, setSessionNetProfit] = useState(0.0);

  // Canvas Refs & Physics
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const spinnerStateRef = useRef({
    items: [],
    targetIndex: 35,
    currentOffset: 0,
    targetOffset: 0,
    isSpinning: false,
    particles: [],
    lastTickIndex: -1,
  });

  const currentCaseCost = selectedCase.price * betMultiplier;

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const state = spinnerStateRef.current;
    const itemWidth = 140;
    const itemGap = 12;
    const stride = itemWidth + itemGap;
    const centerX = width / 2;

    // Clear Background with Stake dark theme
    ctx.fillStyle = '#111922';
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid lines
    ctx.strokeStyle = '#1b2834';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Render Skin Reels Tape
    const offset = state.currentOffset;

    state.items.forEach((item, idx) => {
      const itemX = centerX + idx * stride - offset - itemWidth / 2;

      if (itemX + itemWidth < -50 || itemX > width + 50) return;

      const rarityConfig = RARITY_COLORS[item.category] || RARITY_COLORS.mil_spec;

      // Card Container Fill
      ctx.fillStyle = item.isGold ? '#2a2100' : '#18222d';
      ctx.beginPath();
      ctx.roundRect(itemX, 20, itemWidth, height - 40, 8);
      ctx.fill();

      // Rarity Glowing Border
      ctx.strokeStyle = rarityConfig.border;
      ctx.lineWidth = item.isGold ? 3 : 2;
      ctx.stroke();

      // Top Rarity Indicator Pill
      ctx.fillStyle = rarityConfig.color;
      ctx.beginPath();
      ctx.roundRect(itemX + 8, 28, itemWidth - 16, 4, 2);
      ctx.fill();

      // Animated Gold Glow for GOLD items
      if (item.isGold) {
        const time = Date.now() * 0.003;
        ctx.fillStyle = `rgba(255, 215, 0, ${0.15 + Math.sin(time + idx) * 0.1})`;
        ctx.beginPath();
        ctx.roundRect(itemX + 2, 22, itemWidth - 4, height - 44, 6);
        ctx.fill();
      }

      // Icon Display
      ctx.font = item.isGold ? '36px sans-serif' : '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.icon, itemX + itemWidth / 2, height / 2 - 5);

      // Item Title
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = item.isGold ? '#ffd700' : '#ffffff';
      const shortName = item.name.split('|')[1] || item.name;
      ctx.fillText(shortName.trim().substring(0, 16), itemX + itemWidth / 2, height / 2 + 25);

      // Multiplier Badge
      ctx.font = 'extrabold 12px monospace';
      ctx.fillStyle = item.isGold ? '#ffd700' : rarityConfig.color;
      ctx.fillText(`${item.mult}x`, itemX + itemWidth / 2, height / 2 + 45);
    });

    // Render Particles
    if (state.particles.length > 0) {
      state.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;

        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      state.particles = state.particles.filter((p) => p.alpha > 0);
    }

    // Center Selector Needle Crosshair (Stake Green / Laser)
    ctx.strokeStyle = '#00e701';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Top Triangle Needle
    ctx.fillStyle = '#00e701';
    ctx.beginPath();
    ctx.moveTo(centerX - 12, 0);
    ctx.lineTo(centerX + 12, 0);
    ctx.lineTo(centerX, 18);
    ctx.closePath();
    ctx.fill();

    // Bottom Triangle Needle
    ctx.beginPath();
    ctx.moveTo(centerX - 12, height);
    ctx.lineTo(centerX + 12, height);
    ctx.lineTo(centerX, height - 18);
    ctx.closePath();
    ctx.fill();
  }, []);

  const startSpinAnimation = (winnerItem, fullReelItems) => {
    audioSynth.init();
    audioSynth.playClick();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const itemWidth = 140;
    const itemGap = 12;
    const stride = itemWidth + itemGap;

    // Target index is set around index 35
    const targetIndex = 35;
    const targetOffset = targetIndex * stride;

    const state = spinnerStateRef.current;
    state.items = fullReelItems;
    state.targetIndex = targetIndex;
    state.currentOffset = 0;
    state.targetOffset = targetOffset;
    state.isSpinning = true;
    state.particles = [];
    state.lastTickIndex = -1;

    const duration = turboMode ? 1400 : 3800; // ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      // Smooth Quintic Ease-Out curve for realistic CS2 reel slowing
      const easeOut = 1 - Math.pow(1 - progress, 4);
      state.currentOffset = state.targetOffset * easeOut;

      // Audio Ticks as items cross center
      const currentTickIndex = Math.floor(state.currentOffset / stride);
      if (currentTickIndex !== state.lastTickIndex) {
        state.lastTickIndex = currentTickIndex;
        audioSynth.playTick(1.0 - progress * 0.4);
      }

      renderCanvas();

      if (progress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished!
        state.currentOffset = state.targetOffset;
        state.isSpinning = false;

        setUnboxedItem(winnerItem);
        setGameState('won');

        const payout = currentCaseCost * winnerItem.mult;
        const netWin = payout - currentCaseCost;

        setBalance((prev) => parseFloat((prev + payout).toFixed(2)));
        setSessionNetProfit((prev) => parseFloat((prev + netWin).toFixed(2)));
        setTotalOpened((prev) => prev + 1);

        // Add to Recent Outcomes & Inventory
        setRecentOutcomes((prev) => [winnerItem, ...prev.slice(0, 8)]);
        setInventory((prev) => [
          { ...winnerItem, costPaid: currentCaseCost, winValue: payout },
          ...prev,
        ]);

        // Check if GOLD Drop!
        if (winnerItem.isGold) {
          audioSynth.playGoldJackpot();
          setIsGoldAnimationActive(true);
          setShakeScreen(true);
          setTimeout(() => setShakeScreen(false), 800);

          // Golden Particle Burst
          const p = [];
          for (let i = 0; i < 90; i++) {
            p.push({
              x: canvas.width / 2,
              y: canvas.height / 2,
              vx: (Math.random() - 0.5) * 16,
              vy: (Math.random() - 0.5) * 16,
              size: Math.random() * 6 + 3,
              alpha: 1.0,
              color: '255, 215, 0', // Gold RGB
            });
          }
          state.particles = p;
          renderCanvas();
        } else {
          audioSynth.playLandStandard();
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 200;
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

  const handleOpenCase = () => {
    if (gameState === 'spinning') return;
    if (balance < currentCaseCost) return;

    // Deduct cost
    setBalance((prev) => parseFloat((prev - currentCaseCost).toFixed(2)));
    setGameState('spinning');
    setUnboxedItem(null);
    setIsGoldAnimationActive(false);

    // Pick winner
    const winner = getRandomItemForCase(selectedCase);

    // Generate 50 items for the spinning reel, placing winner at index 35
    const reel = [];
    for (let i = 0; i < 50; i++) {
      if (i === 35) {
        reel.push(winner);
      } else {
        reel.push(getRandomItemForCase(selectedCase));
      }
    }

    startSpinAnimation(winner, reel);
  };

  const handleSellItem = (index) => {
    audioSynth.playClick();
    const item = inventory[index];
    if (!item) return;

    setBalance((prev) => parseFloat((prev + item.winValue).toFixed(2)));
    setInventory((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSellAll = () => {
    audioSynth.playClick();
    const totalVal = inventory.reduce((acc, curr) => acc + curr.winValue, 0);
    setBalance((prev) => parseFloat((prev + totalVal).toFixed(2)));
    setInventory([]);
  };

  return (
    <div
      className={`min-h-screen w-full bg-[#0f171e] text-slate-100 font-sans flex flex-col justify-between select-none overflow-x-hidden ${
        shakeScreen ? 'animate-bounce' : ''
      }`}
    >
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
                  STAKE <span className="text-amber-400">CS2 GOLD</span> 📦
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  audioSynth.muted = !isMuted;
                }}
                className="p-1.5 rounded-lg bg-[#21303c] hover:bg-[#2c3e4e] text-slate-300 transition"
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
                    onClick={() => setBalance(1000.0)}
                    className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-amber-300 font-bold transition"
                  >
                    + Reload
                  </button>
                )}
              </div>
            </div>

            {/* Select Case Tier */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-400 uppercase">Select Case Tier</div>
              <div className="space-y-1.5">
                {CASE_TIERS.map((cs) => (
                  <button
                    key={cs.id}
                    disabled={gameState === 'spinning'}
                    onClick={() => {
                      audioSynth.playClick();
                      setSelectedCase(cs);
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between ${
                      selectedCase.id === cs.id
                        ? 'bg-[#213242] border-[#00e701] text-white shadow-md'
                        : 'bg-[#131b23] border-[#21303c] text-slate-400 hover:bg-[#1a2632]'
                    } disabled:opacity-50`}
                  >
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        {cs.name}
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">
                          {cs.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{cs.desc}</div>
                    </div>
                    <div className="text-xs font-mono font-black text-[#00e701]">
                      ${cs.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier / Quantity Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Bet Multiplier</span>
                <span className="text-amber-400 font-mono">{betMultiplier}x</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 5, 10].map((m) => (
                  <button
                    key={m}
                    disabled={gameState === 'spinning'}
                    onClick={() => {
                      audioSynth.playClick();
                      setBetMultiplier(m);
                    }}
                    className={`py-1.5 rounded text-xs font-extrabold border transition ${
                      betMultiplier === m
                        ? 'bg-[#00e701]/20 border-[#00e701] text-[#00e701]'
                        : 'bg-[#0f171e] border-[#263746] text-slate-300 hover:bg-[#21303c]'
                    } disabled:opacity-50`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Mode Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-[#131b23] rounded-lg border border-[#21303c]">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                ⚡ Fast Spin Speed
              </span>
              <button
                disabled={gameState === 'spinning'}
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
              onClick={handleOpenCase}
              disabled={gameState === 'spinning' || balance < currentCaseCost}
              className={`w-full py-3.5 rounded-lg font-black text-sm uppercase tracking-wider transition-all shadow-lg ${
                gameState === 'spinning'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-[#00e701] hover:bg-[#00c401] text-slate-950 active:scale-98 shadow-[#00e701]/20'
              }`}
            >
              {gameState === 'spinning'
                ? 'OPENING CASE...'
                : `OPEN CASE ($${currentCaseCost.toFixed(2)})`}
            </button>

          </div>

          {/* Footer Provably Fair */}
          <div className="pt-4 mt-4 border-t border-[#243340] flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1 text-[#00e701]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] animate-ping" />
              Provably Fair SHA-256
            </span>
            <span className="text-amber-400 font-bold">RTP 98.5%</span>
          </div>

        </div>

        {/* ================= RIGHT MAIN VIEWPORT ================= */}
        <div className="flex-1 bg-[#162029] rounded-xl border border-[#21303c] p-4 flex flex-col justify-between space-y-4 shadow-xl">
          
          {/* Top Bar: Recent Drops */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#21303c]">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
              👑 RECENT UNBOXINGS:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar">
              {recentOutcomes.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition shrink-0 flex items-center gap-1 ${
                    item.isGold
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                      : 'bg-[#111922] border-[#21303c] text-slate-300'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.mult}x</span>
                </span>
              ))}
            </div>
          </div>

          {/* ================= MAIN CANVAS SPINNER ================= */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 relative">
            <div
              className={`w-full bg-[#111922] rounded-xl border overflow-hidden shadow-inner relative transition-colors ${
                isGoldAnimationActive
                  ? 'border-amber-400 shadow-amber-500/30'
                  : 'border-[#233342]'
              }`}
            >
              <canvas ref={canvasRef} className="w-full h-[200px] block" />
            </div>
          </div>

          {/* Unboxed Item Notification Banner */}
          {unboxedItem && (
            <div
              className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                unboxedItem.isGold
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                  : 'bg-[#131d27] border-[#253748] text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{unboxedItem.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">
                    {unboxedItem.isGold ? '👑 LEGENDARY GOLD DROP!' : 'UNBOXED SKIN'}
                  </div>
                  <div className="text-sm font-extrabold">{unboxedItem.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400">PAYOUT</div>
                <div className="text-base font-black text-[#00e701] font-mono">
                  +${(currentCaseCost * unboxedItem.mult).toFixed(2)} ({unboxedItem.mult}x)
                </div>
              </div>
            </div>
          )}

          {/* User Inventory Section */}
          <div className="bg-[#131c24] p-3 rounded-lg border border-[#21303c] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400 uppercase">
                YOUR INVENTORY ({inventory.length} ITEMS)
              </span>
              {inventory.length > 0 && (
                <button
                  onClick={handleSellAll}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded text-[11px] transition"
                >
                  SELL ALL (${inventory.reduce((a, c) => a + c.winValue, 0).toFixed(2)})
                </button>
              )}
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {inventory.length === 0 ? (
                <div className="col-span-full text-center py-6 text-xs text-slate-500 font-bold">
                  Your unboxed skins and GOLD items will appear here!
                </div>
              ) : (
                inventory.map((inv, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border flex flex-col justify-between text-center relative ${
                      inv.isGold
                        ? 'bg-amber-500/10 border-amber-400/50'
                        : 'bg-[#18232e] border-[#223343]'
                    }`}
                  >
                    <div className="text-xl">{inv.icon}</div>
                    <div className="text-[10px] font-bold truncate text-slate-200">
                      {inv.name}
                    </div>
                    <div className="text-[10px] font-black text-[#00e701] font-mono">
                      ${inv.winValue.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleSellItem(idx)}
                      className="mt-1 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[9px] font-bold text-slate-200"
                    >
                      Sell
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Session Stats Bar */}
          <div className="grid grid-cols-3 bg-[#131c24] p-3 rounded-lg border border-[#21303c] text-xs font-bold text-slate-400 text-center">
            <div>
              Cases Unboxed: <span className="text-white font-mono ml-1">{totalOpened}</span>
            </div>
            <div>
              Session Net Profit:{' '}
              <span
                className={`font-mono ml-1 ${
                  sessionNetProfit >= 0 ? 'text-[#00e701]' : 'text-red-400'
                }`}
              >
                ${sessionNetProfit.toFixed(2)}
              </span>
            </div>
            <div>
              Max Gold Multiplier: <span className="text-amber-400 font-mono ml-1">10,000x</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}