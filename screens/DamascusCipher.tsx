import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StageWrapper from '../components/StageWrapper';
import VideoInterstitial from '../components/VideoInterstitial';

const CRYSTALS = [
  { id: 2, title: 'HIVE HEX', color: '#ae3efe', shape: 'M50 0 L95 25 L95 75 L50 100 L5 75 L5 25 Z' },
  { id: 3, title: 'TUNER FORK', color: '#00ffff', shape: 'M30 5 L70 5 L60 95 L40 95 Z' },
  { id: 6, title: 'LEAF FRACTAL', color: '#39ff14', shape: 'M50 5 Q90 5 90 50 Q50 95 50 95 Q50 95 10 50 Q10 5 50 5' },
  { id: 1, title: 'ORIGIN SPARK', color: '#ccff00', shape: 'M50 5 L90 25 L80 75 L50 95 L20 75 L10 25 Z' },
  { id: 5, title: 'GOLDEN ORB', color: '#ffb622', shape: 'M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0' },
  { id: 8, title: 'PIXEL CUBE', color: '#ff0055', shape: 'M25 25 L75 25 L75 75 L25 75 Z' },
  { id: 7, title: 'ELIXIR DROP', color: '#f53fe8', shape: 'M50 5 Q95 60 50 95 Q5 60 50 5' },
  { id: 4, title: 'ALCOVE LENS', color: '#ffffff', shape: 'M50 10 C90 10 90 90 50 90 C10 90 10 10 50 10 Z' },
];

const CORRECT_ORDER = [2, 3, 6, 1, 5, 8, 7, 4];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DamascusCipher: React.FC = () => {
  const navigate = useNavigate();
  const [placedOrder, setPlacedOrder] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [showPostVideo, setShowPostVideo] = useState(false);
  const completedRef = useRef(false);

  const shuffledCrystals = useMemo(() => shuffleArray(CRYSTALS), []);

  const handleCrystalTap = (crystalId: number) => {
    if (solved || shakeError || placedOrder.includes(crystalId)) return;
    const next = [...placedOrder, crystalId];
    setPlacedOrder(next);
    if (next.length === 8) {
      if (next.every((id, i) => id === CORRECT_ORDER[i])) {
        setSolved(true);
        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(() => setShowPostVideo(true), 600);
        }
      } else {
        setShakeError(true);
        setTimeout(() => {
          setShakeError(false);
          setPlacedOrder([]);
        }, 800);
      }
    }
  };

  const handleReset = () => {
    if (shakeError) return;
    setPlacedOrder([]);
  };

  return (
    <StageWrapper stageId={9} customLayout inlineClue>
      {({ onComplete, isCompleted, cluePanelNode }) => {
        const isDone = isCompleted || solved;

        if (showPostVideo) {
          return (
            <VideoInterstitial
              src="/Video_Generation_Successful.mp4"
              onComplete={() => {
                setShowPostVideo(false);
                onComplete();
              }}
              title="MEMORY RECOVERED"
            />
          );
        }

        return (
          <div className={`bg-background-dark font-display text-white min-h-screen flex flex-col relative overflow-y-auto pb-24 ${shakeError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            {/* Background with grid */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0510] via-background-dark to-black" />
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
              backgroundImage: "linear-gradient(rgba(174,62,254,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(174,62,254,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[0] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-dark/80 backdrop-blur-md border-b border-primary/30">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/')} className="flex items-center justify-center size-10 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 active:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div>
                  <h2 className="text-white text-sm font-bold tracking-widest leading-none">STAGE 09: DAMASCUS CIPHER</h2>
                  <p className="text-primary text-[10px] uppercase font-bold tracking-[0.2em]">
                    {isDone ? 'SPECTRUM RESTORED' : 'DECRYPTION ACTIVE'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${isDone ? 'bg-acid' : 'bg-primary animate-pulse'}`} />
                <span className={`size-2 rounded-full ${isDone ? 'bg-acid' : 'bg-white/20'}`} />
              </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center w-full max-w-lg mx-auto px-4 py-6 gap-5">
              {/* Corner markers */}
              <div className="absolute top-20 left-4 w-10 h-10 border-t-2 border-l-2 border-[#00f2ff] opacity-60" />
              <div className="absolute top-20 right-4 w-10 h-10 border-t-2 border-r-2 border-[#00f2ff] opacity-60" />

              {/* Central AR Reticle with Damascus Star */}
              <div className="relative w-56 h-72 flex items-center justify-center shrink-0" style={{ perspective: '1000px' }}>
                <div className={`relative w-full h-full border-2 ${isDone ? 'border-acid shadow-[0_0_25px_rgba(234,255,0,0.4)]' : 'border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.4)]'} flex items-center justify-center transition-all duration-500`} style={{ transform: "rotateY(-15deg) skewY(2deg)" }}>
                  {/* Corner dots */}
                  <div className={`absolute -top-1 -left-1 w-3 h-3 ${isDone ? 'bg-acid' : 'bg-[#00f2ff]'}`} />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${isDone ? 'bg-acid' : 'bg-[#00f2ff]'}`} />
                  <div className={`absolute inset-4 border ${isDone ? 'border-acid/30' : 'border-[#00f2ff]/30'} opacity-50`} />

                  {/* Damascus Star SVG */}
                  <svg className={`w-40 h-40 ${isDone ? 'text-acid' : 'text-primary'} filter drop-shadow-[0_0_8px_rgba(174,62,254,0.6)] transition-colors duration-500`} fill="none" stroke="currentColor" strokeWidth="0.5" viewBox="0 0 100 100">
                    <path d="M50 5 L61 35 L95 35 L68 55 L78 85 L50 65 L22 85 L32 55 L5 35 L39 35 Z" strokeDasharray="2 1" />
                    <path d="M50 0 L100 50 L50 100 L0 50 Z" opacity="0.3" />
                    <circle cx="50" cy="50" r="45" strokeDasharray="1 3" />
                    <path d="M20 20 L80 80 M80 20 L20 80" opacity="0.2" />
                    {isDone && (
                      <circle cx="50" cy="50" r="20" className="text-acid" strokeWidth="1" opacity="0.6">
                        <animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </svg>

                  {isDone && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-acid text-5xl drop-shadow-[0_0_20px_rgba(234,255,0,0.8)]">check_circle</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Intel Card */}
              <div className="w-full bg-black/80 backdrop-blur-md border-l-4 border-primary p-4 rounded-r-lg shadow-lg">
                <h3 className="text-primary text-[10px] font-bold tracking-widest uppercase mb-1">Mission Intel</h3>
                <p className="text-white text-xs leading-relaxed font-mono">
                  {isDone
                    ? 'The spectrum has been restored. The Fade is reversed. The Damascus Cipher reveals its final truth.'
                    : 'The Syndicate\'s Fade drains all color from the world. Arrange the 8 collected crystals in spectral order — from the void\'s deepest shadow to the full light of restoration.'
                  }
                </p>
              </div>

              {/* Placement Slots */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-mono text-primary uppercase tracking-widest">
                    {isDone ? 'SPECTRUM COMPLETE' : 'RESTORE THE SPECTRUM'}
                  </p>
                  <p className="text-[10px] font-mono text-acid">{placedOrder.length}/8</p>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const placedId = placedOrder[i];
                    const crystal = placedId != null ? CRYSTALS.find(c => c.id === placedId) : null;
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-8 rounded border transition-all duration-300 flex items-center justify-center ${crystal
                          ? 'border-white/20'
                          : i === placedOrder.length
                            ? 'border-primary/60 border-dashed animate-pulse'
                            : 'border-white/10 bg-white/5'
                          }`}
                        style={crystal ? { backgroundColor: `${crystal.color}30`, borderColor: `${crystal.color}60` } : undefined}
                      >
                        {crystal && (
                          <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none">
                            <path d={crystal.shape} fill={crystal.color} opacity={0.8} />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!isDone && (
                  <p className="text-[10px] text-white/40 font-mono mt-1.5 text-center italic">
                    From the void's deepest shadow to the full light of restoration
                  </p>
                )}
              </div>

              {/* Crystal Selector */}
              {!isDone && (
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm">diamond</span>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest">Crystal Bank</p>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
                    {shuffledCrystals.map((crystal) => {
                      const isPlaced = placedOrder.includes(crystal.id);
                      return (
                        <button
                          key={crystal.id}
                          onClick={() => handleCrystalTap(crystal.id)}
                          disabled={isPlaced}
                          className={`group relative shrink-0 w-20 h-24 rounded-lg overflow-hidden transition-all active:scale-95 ${isPlaced
                            ? 'opacity-25 cursor-not-allowed border border-white/5'
                            : 'border border-white/20 hover:border-white/40 cursor-pointer'
                            }`}
                          style={!isPlaced ? { boxShadow: `0 0 12px ${crystal.color}30` } : undefined}
                        >
                          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${crystal.color}15 0%, transparent 70%)` }} />
                          <div className="flex flex-col items-center justify-center h-full gap-1 relative z-10">
                            <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
                              <path d={crystal.shape} fill={crystal.color} opacity={isPlaced ? 0.3 : 0.9} />
                            </svg>
                            <span className="text-[8px] font-mono font-bold tracking-wider" style={{ color: crystal.color }}>
                              {crystal.title}
                            </span>
                          </div>
                          {isPlaced && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <span className="material-symbols-outlined text-white/40 text-lg">check</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reset Button */}
              {!isDone && placedOrder.length > 0 && (
                <button
                  onClick={handleReset}
                  className="px-6 py-2 border border-primary/40 text-primary font-bold rounded-lg text-xs tracking-widest uppercase hover:bg-primary/10 transition-all active:scale-95"
                >
                  RESET ORDER
                </button>
              )}

              {/* Solved state / Clue Panel */}
              {isDone && (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="text-center">
                    <p className="text-acid text-2xl font-bold tracking-[0.3em] drop-shadow-[0_0_20px_rgba(234,255,0,0.8)]">
                      CIPHER SOLVED
                    </p>
                    <p className="text-white/60 text-xs font-mono mt-1">Damascus cipher decoded</p>
                  </div>
                  {cluePanelNode}
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full mt-auto">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">Spectrum Analysis</span>
                  <span className="text-[10px] font-mono text-acid">{isDone ? 100 : Math.round((placedOrder.length / 8) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-acid shadow-[0_0_10px_rgba(234,255,0,0.5)]' : 'bg-gradient-to-r from-primary via-secondary to-primary shadow-[0_0_10px_rgba(245,63,232,0.5)]'}`}
                    style={{ width: `${isDone ? 100 : (placedOrder.length / 8) * 100}%` }}
                  />
                </div>
              </div>
            </main>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50 z-20" />
            {/* Bottom corner markers */}
            <div className="absolute bottom-16 left-4 w-10 h-10 border-b-2 border-l-2 border-[#00f2ff] opacity-60 z-10" />
            <div className="absolute bottom-16 right-4 w-10 h-10 border-b-2 border-r-2 border-[#00f2ff] opacity-60 z-10" />

            <style>{`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                20%, 40%, 60%, 80% { transform: translateX(4px); }
              }
            `}</style>
          </div>
        );
      }}
    </StageWrapper>
  );
};

export default DamascusCipher;
