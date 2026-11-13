import React, { useState, useRef } from 'react';
import StageWrapper from '../components/StageWrapper';

interface MockAnomaly {
  id: number;
  name: string;
  top: string;
  left: string;
  icon: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
}

const MOCK_ANOMALIES: MockAnomaly[] = [
  { id: 0, name: 'FREQ_RIFT_01', top: '25%', left: '20%', icon: 'bolt', textColor: 'text-neon-pink', borderColor: 'border-neon-pink/30', glowColor: 'rgba(255,0,255,0.8)' },
  { id: 1, name: 'VOID_ECHO_02', top: '45%', left: '65%', icon: 'radio_button_checked', textColor: 'text-primary', borderColor: 'border-primary/30', glowColor: 'rgba(174,62,254,0.8)' },
  { id: 2, name: 'GLITCH_NODE_03', top: '70%', left: '35%', icon: 'warning', textColor: 'text-acid', borderColor: 'border-acid/30', glowColor: 'rgba(234,255,0,0.8)' },
];

const QUESTIONS = [
  {
    question: 'What is my nickname for you?',
    answer: 'Wildflower',
    hint: 'W___l__e_',
  },
];

const Stage14Map: React.FC = () => {
  const [purifiedSet, setPurifiedSet] = useState<Set<number>>(new Set());
  const [anomaliesPurified, setAnomaliesPurified] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [answerError, setAnswerError] = useState(false);
  const completedRef = useRef(false);

  const purifyAnomaly = (id: number, isCompleted: boolean) => {
    if (isCompleted || anomaliesPurified || purifiedSet.has(id)) return;
    const next = new Set(purifiedSet);
    next.add(id);
    setPurifiedSet(next);
    if (next.size === 3) {
      setTimeout(() => setAnomaliesPurified(true), 400);
    }
  };

  const checkAnswer = (onComplete: () => void) => {
    const q = QUESTIONS[0];
    if (questionAnswer.trim() === q.answer) {
      completedRef.current = true;
      onComplete();
    } else {
      setAnswerError(true);
      setTimeout(() => setAnswerError(false), 1500);
    }
  };

  const purifiedCount = purifiedSet.size;
  const progressPercent = Math.round((purifiedCount / 3) * 100);

  return (
    <StageWrapper stageId={14} customLayout>
      {({ onComplete, isCompleted }) => (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark text-white select-none">
          {/* Scanline Overlay */}
          <div className="absolute inset-0 z-50 pointer-events-none opacity-30 mix-blend-overlay" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3) 51%)", backgroundSize: "100% 4px" }}></div>
          <div className="absolute inset-0 z-50 pointer-events-none bg-gradient-to-b from-transparent via-primary/5 to-transparent h-full w-full animate-scanline"></div>

          {/* Top Status Bar */}
          <div className="z-40 flex flex-col gap-1 bg-surface-dark/90 backdrop-blur-md p-4 pb-2 border-b border-primary/20 shadow-[0_0_15px_rgba(174,62,254,0.3)] safe-area-top">
            <div className="flex items-center h-8 justify-between">
              <button onClick={() => window.location.href = '/'} className="text-white hover:text-acid transition-colors flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 active:scale-95">
                <span className="material-symbols-outlined">home</span>
              </button>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full bg-acid shadow-[0_0_8px_#eaff00] ${!isCompleted && purifiedCount < 3 ? 'animate-ping' : ''}`}></span>
                <p className="text-acid text-xs font-bold tracking-widest shrink-0">
                  {isCompleted ? 'PURIFICATION COMPLETE' : anomaliesPurified ? 'FINAL VERIFICATION' : 'STATUS: UNSTABLE'}
                </p>
              </div>
              <button className="text-white hover:text-acid transition-colors flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 active:scale-95">
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-[10px] font-mono tracking-widest leading-none mb-1">PROTOCOL: 14-YR</p>
                <h1 className="text-white text-2xl font-bold leading-none tracking-tight">GLITCH TRACKER</h1>
              </div>
              <div className="text-right">
                <p className="text-neon-cyan font-mono text-xs">LAT: 39.1031</p>
                <p className="text-neon-pink font-mono text-xs">LNG: -84.5120</p>
              </div>
            </div>
            {/* Intel Card */}
            <div className="mt-2 bg-black/40 border border-primary/20 rounded-lg p-3">
              <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Intel</p>
              <p className="text-xs text-white/70 leading-relaxed">
                The city is <span className="text-neon-pink font-bold">screaming with distortion</span>. Three reality anomalies are tearing through the map. <span className="text-acid font-bold">Purify each glitch node</span>, then answer the final verification to stabilize the disruption.
              </p>
            </div>
          </div>

          {/* Main Map Area */}
          <div className="relative flex-1 w-full bg-[#0a0a0a] overflow-hidden group">
            <div className="absolute inset-0 w-full h-full">
              <div className="w-full h-full bg-cover bg-center opacity-60 grayscale contrast-125 brightness-75" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCwRJlEwOa_dlUxC2ChCzkp7YFgL6w0IVVqbKoCGIsN7JJp5-PnqsMyYLdGWE_tFFO9WtWyu9gEo9wtQzrcIOno_QjAhiTx0Hf2jm31gVq0nMe8wAkpVu28Gxt4HZSdcvSMu258NNWWlpeOR8csHd8If6_A85k9Y-vRhG4fnL2k0n-B24Weu5OD91tRWNpTDwmJhz09kDW26KWGVlYufVea4oXY4SlxvzoqPN44pZDpQp3eWNEaXs3864ObyFDaY6Qgqg5kGOCPlegX')" }}></div>
              <div className="absolute inset-0 bg-[#050505]/80 mix-blend-hard-light"></div>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
            </div>

            {anomaliesPurified && !isCompleted ? (
              <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-surface-dark/90 border border-primary/30 rounded-xl p-6 shadow-[0_0_30px_rgba(174,62,254,0.3)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-acid">lock</span>
                    <span className="text-acid font-mono text-xs tracking-widest">FINAL VERIFICATION</span>
                  </div>
                  <p className="text-white text-lg font-bold mb-6 leading-relaxed">
                    {QUESTIONS[0].question}
                  </p>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={questionAnswer}
                      onChange={(e) => setQuestionAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkAnswer(onComplete)}
                      placeholder="Enter answer..."
                      className={`w-full bg-black/60 border ${answerError ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-white/20 focus:border-primary'} rounded-lg px-4 py-3 text-white font-mono text-lg tracking-wider outline-none transition-colors placeholder:text-white/30`}
                      autoComplete="off"
                    />
                    {answerError && (
                      <p className="text-red-400 text-xs font-mono mt-2 animate-pulse">INCORRECT - TRY AGAIN</p>
                    )}
                  </div>
                  <p className="text-white/40 text-xs font-mono mb-4">{QUESTIONS[0].hint}</p>
                  <button
                    onClick={() => checkAnswer(onComplete)}
                    className="w-full py-3 bg-gradient-to-r from-primary to-neon-pink text-white font-bold rounded-lg tracking-wider shadow-[0_0_20px_rgba(174,62,254,0.4)] active:scale-95 transition-transform"
                  >
                    VERIFY
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* User Location */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                  <div className="absolute size-32 rounded-full border border-white/10 animate-ping opacity-20"></div>
                  <div className="absolute size-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50"></div>
                  <div className="size-4 bg-white rounded-full shadow-[0_0_15px_white] z-10 relative"></div>
                </div>

                {/* Mock Anomalies */}
                {MOCK_ANOMALIES.map(anomaly => {
                  const isPurified = purifiedSet.has(anomaly.id);
                  return (
                    <button
                      key={anomaly.id}
                      onClick={() => purifyAnomaly(anomaly.id, isCompleted)}
                      disabled={isPurified || isCompleted}
                      className={`absolute z-30 flex flex-col items-center group/anomaly transition-all duration-500 ${isPurified
                        ? 'opacity-20 scale-75 pointer-events-none'
                        : 'animate-bounce cursor-pointer'
                        }`}
                      style={{ top: anomaly.top, left: anomaly.left, animationDelay: `${anomaly.id * 0.5}s` }}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className={`material-symbols-outlined ${anomaly.textColor} text-4xl relative z-10 drop-shadow-[0_0_8px_${anomaly.glowColor}]`}>
                          {isPurified ? 'check_circle' : anomaly.icon}
                        </span>
                        {!isPurified && (
                          <div className={`absolute inset-0 ${anomaly.textColor.replace('text-', 'bg-')}/30 blur-md rounded-full animate-pulse`}></div>
                        )}
                      </div>
                      <span className={`mt-1 bg-black/80 ${anomaly.textColor} text-[10px] px-2 py-0.5 rounded border ${anomaly.borderColor} font-mono backdrop-blur-sm`}>
                        {isPurified ? 'PURIFIED' : anomaly.name}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            <div className="absolute right-4 top-4 flex flex-col gap-3">
              <button className="size-10 flex items-center justify-center rounded-lg bg-surface-dark/90 text-white shadow-lg border border-white/10 active:bg-primary/20 backdrop-blur-md">
                <span className="material-symbols-outlined">my_location</span>
              </button>
            </div>

            {!anomaliesPurified && (
              <div className="absolute bottom-6 right-6 z-30">
                <button className="size-16 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(174,62,254,0.6)] flex items-center justify-center transition-transform active:scale-95 border border-white/20 relative overflow-hidden group/scan">
                  <span className="material-symbols-outlined text-3xl relative z-10">radar</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-neon-pink/50 to-transparent opacity-0 group-hover/scan:opacity-100 transition-opacity"></div>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          <div className="z-40 bg-surface-dark border-t border-primary/20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] pb-6 pt-4 px-4 flex flex-col gap-4 safe-area-bottom">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end px-1">
                <span className="text-acid font-bold text-sm tracking-widest drop-shadow-[0_0_5px_rgba(234,255,0,0.5)]">PURIFICATION LEVEL</span>
                <span className="text-white font-mono text-sm">{isCompleted ? 100 : anomaliesPurified ? 85 : progressPercent}%</span>
              </div>
              <div className="h-4 w-full bg-[#2a2030] rounded overflow-hidden relative border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-acid to-[#bfff00] relative shadow-[0_0_15px_rgba(234,255,0,0.6)] transition-all duration-500"
                  style={{ width: `${isCompleted ? 100 : anomaliesPurified ? 85 : progressPercent}%` }}
                >
                  {!isCompleted && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/80 animate-pulse"></div>
                  )}
                </div>
              </div>
              <p className="text-neon-pink/80 text-[10px] font-mono text-center mt-1 animate-pulse">
                {isCompleted
                  ? 'ALL ANOMALIES PURIFIED - REALITY STABILIZED'
                  : anomaliesPurified
                    ? 'ANSWER THE VERIFICATION QUESTION TO STABILIZE'
                    : purifiedCount > 0
                      ? `${3 - purifiedCount} ANOMALIES REMAINING`
                      : 'WARNING: REALITY INSTABILITY DETECTED'}
              </p>
            </div>

          </div>

          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
              20%, 40%, 60%, 80% { transform: translateX(4px); }
            }
          `}</style>
        </div>
      )}
    </StageWrapper>
  );
};

export default Stage14Map;
