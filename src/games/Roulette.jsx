import React, { useState, useEffect, useRef, useCallback } from "react";
import { playSound } from "react-sounds";
import { 
  Volume2, 
  VolumeX, 
  Shield, 
  RefreshCw, 
  Trophy, 
  History, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  AlertCircle 
} from "lucide-react";

// --- EUROPEAN ROULETTE WHEEL NUMBERS IN WHEEL ORDER ---
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const getNumberColor = (num) => {
  if (num === 0) return "#22c55e"; // Green
  return RED_NUMBERS.includes(num) ? "#ef4444" : "#2d3748"; // Red or Dark Slate
};

const CHIP_VALUES = [0.1, 1, 5, 25, 100, 500];

export default function Roulette() {
  // =========================================================================
  // BACKEND INTEGRATION STATES & APIS (COMMENTED OUT FOR USER BACKEND HOOKUP)
  // =========================================================================
  /*
  // 1. User Balance & Wallet State
  const [userBalance, setUserBalance] = useState(1000.00);

  // 2. Transformed Current Bets Payload state to send to your API endpoint
  // Format: [{ betType: 'red', amount: 50 }, { betType: '14', amount: 10 }]
  const [formattedBetPayload, setFormattedBetPayload] = useState([]);

  // 3. Last Result state from server
  const [lastServerResult, setLastServerResult] = useState({
    winningNumber: null,
    winningColor: null,
    payoutAmount: 0,
    netProfit: 0,
    isWin: false
  });

  // 4. Async Function to call backend spin API
  const sendBetToBackend = async () => {
    try {
      const response = await fetch('/api/roulette/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'USER_12345',
          totalBet: totalBetAmount,
          bets: Object.entries(placedBets).map(([key, amount]) => ({
            betType: key,
            amount: amount
          }))
        })
      });

      const data = await response.json();
      
      // Expected backend response:
      // {
      //   winningNumber: 14,
      //   winningColor: 'red',
      //   payoutAmount: 180,
      //   newBalance: 1130.00,
      //   isWin: true
      // }

      // Set target winning number for Canvas physics engine to land on
      // wheelState.current.targetNumber = data.winningNumber;
      // setUserBalance(data.newBalance);
      
      return data;
    } catch (err) {
      console.error("Failed to process roulette bet on server:", err);
    }
  };
  */

  // --- LOCAL UI & GAME STATES ---
  const [balance, setBalance] = useState(1000.00);
  const [selectedChip, setSelectedChip] = useState(1);
  const [customBetInput, setCustomBetInput] = useState("1.00");
  const [placedBets, setPlacedBets] = useState({}); // { "red": 10, "14": 5 }
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningResult, setWinningResult] = useState(null);
  const [history, setHistory] = useState([14, 0, 32, 19, 7, 21, 2]);
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef(null);

  // Wheel Physics state
  const wheelState = useRef({
    rotation: 0,
    ballAngle: 0,
    ballRadius: 155,
    isSpinning: false,
    speed: 0,
    ballSpeed: 0,
    targetNumber: null,
  });

  // --- SOUND EFFECT HELPER USING REACT-SOUNDS ---
  const triggerSound = (soundName) => {
    if (isMuted) return;
    try {
      playSound(soundName); // e.g. 'ui/click', 'game/coin', etc.
    } catch (err) {
      // Audio playback fallback fallback
    }
  };

  // Compute Total Bet
  const totalBetAmount = Object.values(placedBets).reduce((a, b) => a + b, 0);

  // Handle placing bets on grid
  const handlePlaceBet = (betKey) => {
    if (isSpinning) return;
    const betVal = parseFloat(customBetInput) || selectedChip;
    if (balance < totalBetAmount + betVal) {
      triggerSound('ui/blocked'); // react-sounds effect
      return;
    }

    triggerSound('ui/button_1'); // react-sounds effect
    setPlacedBets((prev) => ({
      ...prev,
      [betKey]: (prev[betKey] || 0) + betVal,
    }));
  };

  // Clear all bets
  const clearBets = () => {
    if (isSpinning) return;
    triggerSound('ui/click');
    setPlacedBets({});
  };

  // Double current bets
  const doubleBets = () => {
    if (isSpinning) return;
    if (balance < totalBetAmount * 2) return;
    triggerSound('ui/click');
    setPlacedBets((prev) => {
      const doubled = {};
      Object.keys(prev).forEach((k) => (doubled[k] = prev[k] * 2));
      return doubled;
    });
  };

  // --- CANVAS CANVAS WHEEL RENDER & ANIMATION LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    const drawWheel = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const outerRadius = 180;
      const innerRadius = 130;
      const numPockets = WHEEL_NUMBERS.length;
      const sliceAngle = (Math.PI * 2) / numPockets;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Outer Gold Rim
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#d97706";
      ctx.stroke();
      ctx.restore();

      // 2. Draw Wheel Pockets
      for (let i = 0; i < numPockets; i++) {
        const num = WHEEL_NUMBERS[i];
        const startAngle = wheelState.current.rotation + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = getNumberColor(num);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#0f172a";
        ctx.stroke();

        // Pocket Text Numbers
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(num.toString(), outerRadius - 10, 4);
        ctx.restore();
      }

      // 3. Draw Wheel Center Brass Hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#d97706";
      ctx.stroke();

      // Brass Cross Turret
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(wheelState.current.rotation * 1.5);
      ctx.fillStyle = "#f59e0b";
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(-4, -50, 8, 100);
      }
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#b45309";
      ctx.fill();
      ctx.restore();

      // 4. Draw Ball
      if (wheelState.current.isSpinning || winningResult !== null) {
        const ballX = centerX + Math.cos(wheelState.current.ballAngle) * wheelState.current.ballRadius;
        const ballY = centerY + Math.sin(wheelState.current.ballAngle) * wheelState.current.ballRadius;

        // Shadow
        ctx.beginPath();
        ctx.arc(ballX + 2, ballY + 2, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fill();

        // White Pearl Ball
        ctx.beginPath();
        ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(ballX - 2, ballY - 2, 1, ballX, ballY, 7);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(1, "#cbd5e1");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Physics Updates during active spin
      if (wheelState.current.isSpinning) {
        wheelState.current.rotation += wheelState.current.speed;
        wheelState.current.ballAngle -= wheelState.current.ballSpeed;

        // Deceleration
        wheelState.current.speed *= 0.991;
        wheelState.current.ballSpeed *= 0.985;

        // Ball drops towards inner wheel pockets as it slows down
        if (wheelState.current.ballRadius > 142) {
          wheelState.current.ballRadius -= 0.15;
        }

        // Spin complete
        if (wheelState.current.speed < 0.001 && wheelState.current.ballSpeed < 0.001) {
          wheelState.current.isSpinning = false;
          handleSpinComplete();
        }
      }

      animationId = requestAnimationFrame(drawWheel);
    };

    drawWheel();
    return () => cancelAnimationFrame(animationId);
  }, [winningResult]);

  // Handle spin button press
  const spinWheel = () => {
    if (isSpinning || totalBetAmount === 0) return;
    if (totalBetAmount > balance) return;

    // Deduct bet balance upfront
    setBalance((prev) => prev - totalBetAmount);
    setIsSpinning(true);
    setWinningResult(null);

    triggerSound('ui/button_1');

    // Set Physics initial speeds
    wheelState.current.isSpinning = true;
    wheelState.current.speed = 0.15 + Math.random() * 0.05;
    wheelState.current.ballSpeed = 0.22 + Math.random() * 0.05;
    wheelState.current.ballRadius = 165;
  };

  // Determine Winning outcome at end of animation loop
  const handleSpinComplete = () => {
    setIsSpinning(false);

    // Calculate pocket ball landed in based on relative angle
    const sliceAngle = (Math.PI * 2) / WHEEL_NUMBERS.length;
    let normRotation = wheelState.current.rotation % (Math.PI * 2);
    let normBall = wheelState.current.ballAngle % (Math.PI * 2);
    if (normRotation < 0) normRotation += Math.PI * 2;
    if (normBall < 0) normBall += Math.PI * 2;

    let relativeAngle = (normBall - normRotation) % (Math.PI * 2);
    if (relativeAngle < 0) relativeAngle += Math.PI * 2;

    const landedIndex = Math.floor(relativeAngle / sliceAngle) % WHEEL_NUMBERS.length;
    const landedNumber = WHEEL_NUMBERS[landedIndex];
    const landedColor = getNumberColor(landedNumber);

    // Calculate Wins
    let totalWin = 0;
    Object.entries(placedBets).forEach(([betKey, amount]) => {
      // Direct Straight Up Number Match
      if (betKey === landedNumber.toString()) {
        totalWin += amount * 36;
      }
      // Color Matches
      else if (betKey === "red" && RED_NUMBERS.includes(landedNumber)) {
        totalWin += amount * 2;
      } else if (betKey === "black" && landedNumber !== 0 && !RED_NUMBERS.includes(landedNumber)) {
        totalWin += amount * 2;
      }
      // Even / Odd
      else if (betKey === "even" && landedNumber !== 0 && landedNumber % 2 === 0) {
        totalWin += amount * 2;
      } else if (betKey === "odd" && landedNumber !== 0 && landedNumber % 2 !== 0) {
        totalWin += amount * 2;
      }
      // High / Low Ranges
      else if (betKey === "1-18" && landedNumber >= 1 && landedNumber <= 18) {
        totalWin += amount * 2;
      } else if (betKey === "19-36" && landedNumber >= 19 && landedNumber <= 36) {
        totalWin += amount * 2;
      }
      // Dozens
      else if (betKey === "1-12" && landedNumber >= 1 && landedNumber <= 12) {
        totalWin += amount * 3;
      } else if (betKey === "13-24" && landedNumber >= 13 && landedNumber <= 24) {
        totalWin += amount * 3;
      } else if (betKey === "25-36" && landedNumber >= 25 && landedNumber <= 36) {
        totalWin += amount * 3;
      }
    });

    setWinningResult({
      number: landedNumber,
      color: landedColor,
      winAmount: totalWin,
    });

    setHistory((prev) => [landedNumber, ...prev.slice(0, 9)]);

    if (totalWin > 0) {
      setBalance((prev) => prev + totalWin);
      triggerSound('game/coin'); // react-sounds victory blip
    } else {
      triggerSound('ui/blocked');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f212e] text-slate-100 font-sans select-none">
      
      {/* LEFT CONTROL SIDEBAR PANEL */}
      <div className="w-80 border-r border-slate-800 bg-[#1a2c38] p-5 flex flex-col justify-between shrink-0 shadow-2xl z-10">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h1 className="font-bold text-lg text-white tracking-wide">Roulette</h1>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          {/* Balance Display */}
          <div className="bg-[#0f212e] p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium mb-1">User Balance</div>
            <div className="text-xl font-bold text-emerald-400 tracking-tight">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Bet Amount</span>
              <span>${totalBetAmount.toFixed(2)} Active</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                value={customBetInput}
                onChange={(e) => setCustomBetInput(e.target.value)}
                className="w-full bg-[#0f212e] border border-slate-700 rounded-lg py-2.5 pl-3 pr-20 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-1 flex items-center gap-1">
                <button
                  onClick={() => setCustomBetInput((prev) => (parseFloat(prev || 0) / 2).toFixed(2))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold rounded"
                >
                  ½
                </button>
                <button
                  onClick={() => setCustomBetInput((prev) => (parseFloat(prev || 0) * 2).toFixed(2))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold rounded"
                >
                  2×
                </button>
              </div>
            </div>
          </div>

          {/* Quick Chip Selectors */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-medium">Select Chip Value</div>
            <div className="grid grid-cols-3 gap-2">
              {CHIP_VALUES.map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setSelectedChip(val);
                    setCustomBetInput(val.toString());
                    triggerSound('ui/click');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedChip === val
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30"
                      : "bg-[#0f212e] border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Action Bet Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={clearBets}
              disabled={isSpinning}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold rounded-lg text-xs"
            >
              Clear Bets
            </button>
            <button
              onClick={doubleBets}
              disabled={isSpinning}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold rounded-lg text-xs"
            >
              Double 2x
            </button>
          </div>

          {/* Main Spin Action */}
          <button
            onClick={spinWheel}
            disabled={isSpinning || totalBetAmount === 0}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-extrabold rounded-xl text-base shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider"
          >
            {isSpinning ? "Spinning Wheel..." : "Bet & Spin"}
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
          <span className="flex items-center gap-1"><Shield size={12}/> Provably Fair</span>
          <span>97.30% RTP</span>
        </div>
      </div>

      {/* RIGHT MAIN GAME CANVAS DISPLAY */}
      <div className="flex-1 flex flex-col justify-between p-6 bg-[#0f212e] overflow-y-auto">
        
        {/* Top Bar - Spin History */}
        <div className="flex items-center justify-between bg-[#1a2c38] px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <History size={14} />
            <span>Recent Spin History</span>
          </div>
          <div className="flex items-center gap-1.5">
            {history.map((num, idx) => (
              <span
                key={idx}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow"
                style={{ backgroundColor: getNumberColor(num) }}
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {/* Center Section: Canvas Wheel + Winning Result Badge */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="max-w-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
          />

          {/* Result Banner Overlay */}
          {winningResult && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0f212e]/95 border-2 border-amber-500 px-6 py-4 rounded-2xl flex flex-col items-center shadow-2xl backdrop-blur-md animate-bounce">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Outcome</div>
              <div
                className="text-3xl font-black my-1 px-4 py-1 rounded-lg text-white"
                style={{ backgroundColor: winningResult.color }}
              >
                {winningResult.number}
              </div>
              <div className="text-sm font-bold text-emerald-400">
                {winningResult.winAmount > 0 ? `+${winningResult.winAmount.toFixed(2)} USD` : "No Win"}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM BETTING GRID BOARD (REF MATCH) */}
        <div className="bg-[#1a2c38] p-4 rounded-2xl border border-slate-800 shadow-xl max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-[50px_repeat(12,1fr)_60px] gap-1.5 text-center">
            
            {/* Zero (0) Single Green Slot */}
            <button
              onClick={() => handlePlaceBet("0")}
              className="row-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg flex flex-col items-center justify-center relative shadow"
            >
              <span>0</span>
              {placedBets["0"] && (
                <span className="absolute bottom-1 bg-amber-400 text-black text-[10px] font-bold px-1 rounded-full">
                  ${placedBets["0"]}
                </span>
              )}
            </button>

            {/* 3x12 Inside Numbers Grid */}
            {[
              [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
              [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
              [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
            ].map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePlaceBet(num.toString())}
                    className="h-12 text-sm font-bold text-white rounded-md relative transition flex items-center justify-center shadow"
                    style={{ backgroundColor: getNumberColor(num) }}
                  >
                    {num}
                    {placedBets[num.toString()] && (
                      <span className="absolute bottom-0.5 right-0.5 bg-amber-400 text-black text-[9px] font-bold px-1 rounded-full">
                        ${placedBets[num.toString()]}
                      </span>
                    )}
                  </button>
                ))}
                {/* 2:1 Column Bets */}
                <button
                  onClick={() => handlePlaceBet(`col-${3 - rowIndex}`)}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-md relative flex items-center justify-center"
                >
                  2:1
                  {placedBets[`col-${3 - rowIndex}`] && (
                    <span className="absolute bottom-0.5 right-0.5 bg-amber-400 text-black text-[9px] font-bold px-1 rounded-full">
                      ${placedBets[`col-${3 - rowIndex}`]}
                    </span>
                  )}
                </button>
              </React.Fragment>
            ))}

            {/* Dozen Bets Row */}
            <div className="col-start-2 col-span-12 grid grid-cols-3 gap-1.5 mt-1">
              {["1-12", "13-24", "25-36"].map((dozen) => (
                <button
                  key={dozen}
                  onClick={() => handlePlaceBet(dozen)}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-md relative shadow"
                >
                  {dozen.replace("-", " to ")}
                  {placedBets[dozen] && (
                    <span className="ml-2 bg-amber-400 text-black text-[10px] font-bold px-1.5 rounded-full">
                      ${placedBets[dozen]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Outside Bets Row (Red / Black / Even / Odd) */}
            <div className="col-start-2 col-span-12 grid grid-cols-6 gap-1.5 mt-1">
              <button
                onClick={() => handlePlaceBet("1-18")}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-md relative shadow"
              >
                1 to 18
                {placedBets["1-18"] && (
                  <span className="ml-1 bg-amber-400 text-black text-[10px] font-bold px-1 rounded-full">
                    ${placedBets["1-18"]}
                  </span>
                )}
              </button>
              <button
                onClick={() => handlePlaceBet("even")}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-md relative shadow"
              >
                Even
                {placedBets["even"] && (
                  <span className="ml-1 bg-amber-400 text-black text-[10px] font-bold px-1 rounded-full">
                    ${placedBets["even"]}
                  </span>
                )}
              </button>
              
              {/* Red Color Bet Box */}
              <button
                onClick={() => handlePlaceBet("red")}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded-md relative shadow"
              >
                Red
                {placedBets["red"] && (
                  <span className="ml-1 bg-amber-400 text-black text-[10px] font-bold px-1 rounded-full">
                    ${placedBets["red"]}
                  </span>
                )}
              </button>

              {/* Black Color Bet Box */}
              <button
                onClick={() => handlePlaceBet("black")}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white rounded-md relative shadow border border-slate-700"
              >
                Black
                {placedBets["black"] && (
                  <span className="ml-1 bg-amber-400 text-black text-[10px] font-bold px-1 rounded-full">
                    ${placedBets["black"]}
                  </span>
                )}
              </button>

              <button
                onClick={() => handlePlaceBet("odd")}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-md relative shadow"
              >
                Odd
                {placedBets["odd"] && (
                  <span className="ml-1 bg-amber-400 text-black text-[10px] font-bold px-1 rounded-full">
                    ${placedBets["odd"]}
                  </span>
                )}
              </button>
              <button
                onClick={() => handlePlaceBet("19-36")}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-md relative shadow"
              >
                19 to 36
                {placedBets["19-36"] && (
                  <span className="ml-1 bg-amber-400 text-black text-[10px] font-bold px-1 rounded-full">
                    ${placedBets["19-36"]}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}