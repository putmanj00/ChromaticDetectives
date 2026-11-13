import React, { useState, useRef, useCallback } from 'react';
import StageWrapper from '../components/StageWrapper';

const TRIVIA_QUESTIONS = [
  {
    question: 'According to the intercepted evidence, in what year was Protocol 14 initiated?',
    answer: '2012',
  },
];

const Stage07Bridge: React.FC = () => {
  const [holdProgress, setHoldProgress] = useState(0);
  const [granted, setGranted] = useState(false);
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [triviaInput, setTriviaInput] = useState('');
  const [triviaShake, setTriviaShake] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const HOLD_DURATION = 3000;
  const UPDATE_INTERVAL = 30;

  const currentQuestion = TRIVIA_QUESTIONS[0];

  const handleTriviaSubmit = () => {
    if (triviaInput.trim().toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setTriviaAnswered(true);
    } else {
      setTriviaShake(true);
      setTimeout(() => setTriviaShake(false), 500);
    }
  };

  const startHold = useCallback((onComplete: () => void) => {
    if (granted || !triviaAnswered) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setGranted(true);
        onComplete();
      }
    }, UPDATE_INTERVAL);
  }, [granted, triviaAnswered]);

  const endHold = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!granted) {
      setHoldProgress(0);
    }
  }, [granted]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <StageWrapper stageId={7}>
      {({ onComplete, isCompleted }) => (
        <div className="bg-background-dark font-display text-white min-h-[70vh] flex flex-col relative overflow-hidden rounded-lg">
          <div className="absolute inset-0 z-0 bg-grit-pattern opacity-30"></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>

          <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-8 pb-24">
            {/* Intel Card */}
            <div className="w-full max-w-sm">
              <div className="bg-black/40 border border-neon-lime/20 rounded-lg p-3">
                <p className="text-[10px] font-mono text-neon-lime uppercase tracking-widest mb-1">Intel</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  This transit point is a <span className="text-neon-lime font-bold">temporal gate</span> between worlds. The Syndicate sealed crystal shard behind a <span className="text-secondary font-bold">biometric lock</span>. Answer the security question, then prove your identity with a <span className="text-acid font-bold">fingerprint scan</span>.
                </p>
              </div>
            </div>

            {/* ID Card */}
            <div className="relative w-full max-w-sm aspect-[1.6] bg-[#0a0f0a] rounded-xl border-2 border-neon-lime/50 shadow-[0_0_30px_rgba(57,255,20,0.2)] overflow-hidden flex flex-col p-4 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-neon-lime shadow-[0_0_10px_#39ff14]"></div>

              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neon-lime/60 font-mono">ISSUED BY</span>
                  <span className="text-sm font-bold tracking-widest text-white">PROTOCOL_14</span>
                </div>
                <span className="material-symbols-outlined text-neon-lime text-3xl">qr_code_2</span>
              </div>

              <div className="flex gap-4 items-center mt-2">
                <div className="size-20 bg-neon-lime/20 rounded-lg border border-neon-lime/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-neon-lime">face</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-2 w-32 bg-neon-lime/20 rounded"></div>
                  <div className="h-2 w-24 bg-neon-lime/20 rounded"></div>
                  <div className="h-2 w-28 bg-neon-lime/20 rounded"></div>
                </div>
              </div>

              <div className="mt-auto flex justify-between items-center">
                <span className="text-[8px] font-mono text-neon-lime/40">ID: 884-XJ-99</span>
                <div className={`px-2 py-0.5 border rounded text-[10px] font-bold ${granted || isCompleted ? 'bg-neon-lime/30 border-neon-lime text-neon-lime' : 'bg-neon-lime/20 border-neon-lime text-neon-lime animate-pulse'}`}>
                  {granted || isCompleted ? 'VERIFIED' : triviaAnswered ? 'SCAN READY' : 'TRIVIA REQUIRED'}
                </div>
              </div>

              {!granted && !isCompleted && (
                <div className="absolute top-0 left-0 w-full h-2 bg-white/80 shadow-[0_0_20px_white] z-20 animate-scan"></div>
              )}
            </div>

            {/* Trivia Phase */}
            {!triviaAnswered && !granted && !isCompleted && (
              <div className={`w-full max-w-sm space-y-4 ${triviaShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                <p className="text-neon-lime font-mono text-xs tracking-widest text-center">[ SECURITY QUESTION ]</p>
                <p className="text-white/80 text-sm text-center leading-relaxed">{currentQuestion.question}</p>
                <p className="text-neon-lime/60 text-[10px] font-mono text-center tracking-widest">CHECK YOUR EVIDENCE ARCHIVE FROM PREVIOUS STAGES</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={triviaInput}
                    onChange={(e) => setTriviaInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTriviaSubmit()}
                    placeholder="Your answer..."
                    className="flex-1 bg-black/60 border border-neon-lime/30 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-neon-lime"
                  />
                  <button
                    onClick={handleTriviaSubmit}
                    className="px-4 py-3 bg-neon-lime/20 border border-neon-lime/50 rounded-lg text-neon-lime font-bold text-sm active:scale-95"
                  >
                    SUBMIT
                  </button>
                </div>
              </div>
            )}

            {/* Bio-metric phase */}
            {triviaAnswered && (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-neon-lime font-mono text-xs tracking-widest">[ BIO-METRIC HANDSHAKE ]</p>
                <p className="text-white/60 text-sm max-w-xs leading-relaxed">
                  {granted || isCompleted
                    ? 'Biometric signature confirmed. Access granted.'
                    : 'Place your thumb on the scanner and hold for 3 seconds.'}
                </p>
              </div>
            )}

            {(granted || isCompleted) && (
              <div className="text-center animate-pulse">
                <p className="text-neon-lime text-2xl font-bold tracking-[0.3em] drop-shadow-[0_0_20px_rgba(57,255,20,0.8)]">ACCESS GRANTED</p>
              </div>
            )}

            {triviaAnswered && !granted && !isCompleted && (
              <div className="relative flex items-center justify-center">
                <svg className="absolute" width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(57,255,20,0.2)" strokeWidth="4" />
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="#39ff14" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: holdProgress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear', filter: 'drop-shadow(0 0 6px rgba(57,255,20,0.8))' }} />
                </svg>
                <button
                  className="size-24 rounded-full bg-black border-2 border-neon-lime shadow-[0_0_30px_rgba(57,255,20,0.3)] flex items-center justify-center relative group overflow-hidden active:scale-95 transition-transform"
                  onMouseDown={() => startHold(onComplete)}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  onTouchStart={() => startHold(onComplete)}
                  onTouchEnd={endHold}
                  onTouchCancel={endHold}
                >
                  <div className="absolute inset-0 bg-neon-lime/10 group-hover:bg-neon-lime/20 transition-colors"></div>
                  <span className="material-symbols-outlined text-5xl text-neon-lime relative z-10 group-active:text-white">fingerprint</span>
                </button>
              </div>
            )}
          </main>

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

export default Stage07Bridge;
