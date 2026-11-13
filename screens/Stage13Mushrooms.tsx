import React, { useState, useRef } from 'react';
import StageWrapper from '../components/StageWrapper';
import CameraCapture from '../components/CameraCapture';
import { useGeminiVision } from '../lib/useGeminiVision';

const SPECTRAL_ORDER = ['red', 'orange', 'yellow', 'green', 'blue'] as const;
type MushroomColor = typeof SPECTRAL_ORDER[number];

const MUSHROOM_CONFIGS_BASE: { color: MushroomColor; hex: string; label: string; borderColor: string; textColor: string; shadowColor: string; bgActive: string; icon: string }[] = [
  { color: 'red', hex: '#ff3b3b', label: 'AMANITA', borderColor: 'border-[#ff3b3b]', textColor: 'text-[#ff3b3b]', shadowColor: 'shadow-[0_0_15px_rgba(255,59,59,0.5)]', bgActive: 'bg-[#ff3b3b]/20', icon: 'emergency' },
  { color: 'orange', hex: '#ff8c00', label: 'CORTINAR', borderColor: 'border-[#ff8c00]', textColor: 'text-[#ff8c00]', shadowColor: 'shadow-[0_0_15px_rgba(255,140,0,0.5)]', bgActive: 'bg-[#ff8c00]/20', icon: 'warning' },
  { color: 'yellow', hex: '#ffd700', label: 'CHANTERL', borderColor: 'border-[#ffd700]', textColor: 'text-[#ffd700]', shadowColor: 'shadow-[0_0_15px_rgba(255,215,0,0.5)]', bgActive: 'bg-[#ffd700]/20', icon: 'light_mode' },
  { color: 'green', hex: '#39ff14', label: 'MYCENA', borderColor: 'border-[#39ff14]', textColor: 'text-[#39ff14]', shadowColor: 'shadow-[0_0_15px_rgba(57,255,20,0.5)]', bgActive: 'bg-[#39ff14]/20', icon: 'forest' },
  { color: 'blue', hex: '#3b82f6', label: 'LACCARIA', borderColor: 'border-[#3b82f6]', textColor: 'text-[#3b82f6]', shadowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]', bgActive: 'bg-[#3b82f6]/20', icon: 'water_drop' },
];

const BAR_COLORS = [
  'bg-gradient-to-t from-[#ff3b3b] to-[#ff6b6b]',
  'bg-gradient-to-t from-[#ff8c00] to-[#ffb347]',
  'bg-gradient-to-t from-[#ffd700] to-[#ffed4a]',
  'bg-gradient-to-t from-[#39ff14] to-[#7dff5c]',
  'bg-gradient-to-t from-[#3b82f6] to-[#60a5fa]',
];

const Stage13Mushrooms: React.FC = () => {
  // Randomize order on mount
  const [shuffledConfigs] = useState(() => [...MUSHROOM_CONFIGS_BASE].sort(() => Math.random() - 0.5));
  const [tappedSequence, setTappedSequence] = useState<MushroomColor[]>([]);
  const [shakeError, setShakeError] = useState(false);
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const completedRef = useRef(false);

  const vision = useGeminiVision({
    referenceImagePath: '/krohnOwl.jpg',
    matchPrompt: 'Does this photo show an owl sculpture, owl statue, owl decoration, or the Krohn Conservatory owl? Look for any owl figure or owl-themed artwork.',
  });

  const handleMushroomTap = (color: MushroomColor, isCompleted: boolean) => {
    if (isCompleted || shakeError || sequenceComplete) return;

    const nextIndex = tappedSequence.length;
    const expectedColor = SPECTRAL_ORDER[nextIndex];

    if (color === expectedColor) {
      const newSequence = [...tappedSequence, color];
      setTappedSequence(newSequence);
      if (newSequence.length === 5) {
        setTimeout(() => setSequenceComplete(true), 400);
      }
    } else {
      setShakeError(true);
      setTimeout(() => {
        setTappedSequence([]);
        setShakeError(false);
      }, 800);
    }
  };

  const handleCapture = (base64: string) => {
    setCameraOpen(false);
    vision.analyze(base64);
  };

  const collectedCount = tappedSequence.length;

  return (
    <StageWrapper stageId={13} inlineClue>
      {({ onComplete, isCompleted, cluePanelNode }) => {
        if (vision.result?.isMatch && !isCompleted && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onComplete(), 500);
        }

        return (
          <div className={`bg-black font-display text-white min-h-screen flex flex-col relative w-full ${shakeError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            <div className="absolute inset-0 w-full h-full z-0">
              <div aria-label="Dark glowing garden" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMrbn197R5NCs3OSrnjGE51XY2Vyx64fumc6vZfPFzWQ3Fkc5ARUC4EE0ybq2gihrnlVUbhnzTrI6XITJd6VQOhMlCuWEKplvTmEi0FFa2oERWIVZTX0NTVbgrRYg41fO_oZ7gYPU98ykAzy5lFGm3tfSo1OX-cM7uYOt2ON_2Bqa48kqJlU4zwQBVcLyk6O7IESyXKKI7BEsH7iAJscUBCKKHEmL_FEEctT-F89Y9DIeN1JQdN8ZAcethsm1O0xQ9X16_hyfvTZCX')", filter: "brightness(0.4) contrast(1.2) saturate(1.2)" }}></div>
              <div className="absolute bottom-0 w-full h-[60%] perspective-grid z-0 opacity-60" style={{ transform: "perspective(500px) rotateX(60deg) translateY(-100px) scale(2)", backgroundImage: "linear-gradient(to right, rgba(174, 62, 254, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(174, 62, 254, 0.3) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)" }}></div>
              <div className="scanline"></div>
            </div>

            <div className="relative z-20 flex flex-col h-full justify-between pointer-events-none">
              <div className="flex flex-col w-full bg-gradient-to-b from-black/90 to-transparent pt-4 pb-8 px-4 pointer-events-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10"></div>
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-primary mb-1">PROTOCOL: ACTIVE</div>
                    <h1 className="text-white text-lg font-bold tracking-tight shadow-black drop-shadow-md">STAGE 13: FUNGAL GLOW</h1>
                  </div>
                  <button className="flex items-center justify-center size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 active:bg-primary/50 transition-colors">
                    <span className="material-symbols-outlined text-white">settings</span>
                  </button>
                </div>
                {/* Intel Card */}
                <div className="w-full bg-black/40 border border-neon-pink/20 rounded-lg p-3 mb-2">
                  <p className="text-[10px] font-mono text-neon-pink uppercase tracking-widest mb-1">Intel</p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    The <span className="text-neon-pink font-bold">Fungal Glow</span> has started to fight the fade and bring back the spectral colors. Collect the <span className="text-acid font-bold">spectral fungi</span> in chromatic order, then find and photograph the <span className="text-primary font-bold">owl guardian</span> to unlock more intel.
                  </p>
                </div>

                <div className="relative w-full overflow-hidden rounded-xl border border-primary/30 bg-black/60 backdrop-blur-md p-3">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-pink via-primary to-neon-lime"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xs text-gray-300 font-medium tracking-wider mb-0.5">CURRENT OBJECTIVE</h2>
                      <p className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white animate-shimmer" style={{ backgroundSize: "200% auto" }}>
                        {isCompleted ? 'SPECTRUM COMPLETE' : sequenceComplete ? 'PHOTOGRAPH THE OWL' : 'COLLECT IN SPECTRAL ORDER'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-neon-pink animate-pulse">waves</span>
                  </div>
                </div>
              </div>

              {/* Main Area: Mushrooms or Camera or Clue */}
              <div className="flex-1 relative pointer-events-auto flex items-center justify-center px-4">
                {isCompleted && cluePanelNode ? (
                  <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-6">
                      <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/40 mb-4 shadow-[0_0_20px_rgba(174,62,254,0.3)]">
                        <span className="material-symbols-outlined text-4xl text-primary">owl</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-widest uppercase shadow-neon">GUARDIAN FOUND</h2>
                      <p className="text-xs font-mono text-neon-pink mt-2 tracking-wider">SPECTRAL PATH UNLOCKED</p>
                    </div>
                    {cluePanelNode}
                  </div>
                ) : sequenceComplete && !isCompleted ? (
                  <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                    {cameraOpen ? (
                      <CameraCapture
                        isActive={cameraOpen}
                        onCapture={handleCapture}
                        onClose={() => setCameraOpen(false)}
                      >
                        <div className="absolute inset-4">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-pink"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-pink"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-pink"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-pink"></div>
                        </div>
                      </CameraCapture>
                    ) : vision.isAnalyzing ? (
                      <>
                        <div className="size-20 rounded-full border-4 border-primary/40 flex items-center justify-center animate-pulse">
                          <span className="material-symbols-outlined text-4xl text-primary animate-spin">settings</span>
                        </div>
                        <p className="text-neon-pink font-mono text-sm tracking-widest">ANALYZING OWL SIGNATURE...</p>
                      </>
                    ) : vision.error ? (
                      <>
                        <span className="material-symbols-outlined text-5xl text-red-400">warning</span>
                        <p className="text-red-400 font-mono text-xs text-center">{vision.error}</p>
                        <button
                          onClick={() => { vision.reset(); setCameraOpen(true); }}
                          className="px-6 py-3 bg-primary text-white font-bold rounded-lg tracking-wider shadow-[0_0_20px_rgba(174,62,254,0.4)] active:scale-95 transition-transform"
                        >
                          TRY AGAIN
                        </button>
                        {vision.quotaExhausted && (
                          <button
                            onClick={() => vision.manualConfirm()}
                            className="px-6 py-3 bg-solar/20 border border-solar/50 text-solar font-bold rounded-lg tracking-wider text-sm shadow-[0_0_15px_rgba(255,182,34,0.3)] active:scale-95 transition-transform"
                          >
                            CONFIRM MANUALLY
                          </button>
                        )}
                      </>
                    ) : vision.result && !vision.result.isMatch ? (
                      <>
                        <span className="material-symbols-outlined text-5xl text-neon-pink">error_outline</span>
                        <p className="text-neon-pink font-mono text-sm tracking-widest text-center">NO OWL DETECTED - TRY AGAIN</p>
                        <button
                          onClick={() => { vision.reset(); setCameraOpen(true); }}
                          className="px-6 py-3 bg-primary text-white font-bold rounded-lg tracking-wider shadow-[0_0_20px_rgba(174,62,254,0.4)] active:scale-95 transition-transform"
                        >
                          RETRY SCAN
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="size-24 rounded-full border-2 border-neon-pink/50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-neon-pink">photo_camera</span>
                        </div>
                        <div className="text-center">
                          <p className="text-white text-lg font-bold mb-1">SPECTRUM COLLECTED</p>
                          <p className="text-neon-pink font-mono text-xs tracking-widest">FIND AND PHOTOGRAPH THE OWL</p>
                          <p className="text-white/40 font-mono text-[10px] tracking-widest mt-2">TAP THE CAMERA BELOW</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-3 w-full max-w-sm">
                    {shuffledConfigs.map((mushroom, idx) => {
                      const isCollected = tappedSequence.includes(mushroom.color);
                      const isNext = !isCollected && tappedSequence.length === idx;
                      return (
                        <button
                          key={mushroom.color}
                          onClick={() => handleMushroomTap(mushroom.color, isCompleted)}
                          disabled={isCompleted || isCollected}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border backdrop-blur-md transition-all duration-300 ${isCollected
                            ? `${mushroom.bgActive} ${mushroom.borderColor} opacity-40 scale-90`
                            : isNext
                              ? `bg-black/80 ${mushroom.borderColor} ${mushroom.shadowColor} animate-pulse`
                              : `bg-black/60 border-white/10 hover:${mushroom.borderColor}`
                            }`}
                        >
                          <span className={`material-symbols-outlined text-2xl ${isCollected ? mushroom.textColor : isNext ? mushroom.textColor : 'text-white/50'}`}>
                            {mushroom.icon}
                          </span>
                          <span className={`text-[8px] font-bold tracking-widest ${isCollected ? mushroom.textColor : 'text-white/40'}`}>
                            {mushroom.label}
                          </span>
                          <div className={`text-[9px] font-mono ${mushroom.textColor}`}>{mushroom.hex}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="w-full bg-gradient-to-t from-black via-black/90 to-transparent pb-6 pt-12 px-4 pointer-events-auto mt-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-black/60 backdrop-blur border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400">COLLECTED</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`w-2 h-6 rounded-full transition-all duration-300 ${i < collectedCount
                            ? `${BAR_COLORS[i]} shadow-[0_0_10px_currentColor]`
                            : i === collectedCount && !isCompleted && !sequenceComplete
                              ? 'border border-primary animate-pulse shadow-[0_0_5px_#ae3efe] bg-primary/20'
                              : 'bg-white/10'
                            }`}
                        ></div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white ml-1">{collectedCount}/5</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 pb-8">
                  <button
                    className={`relative group size-24 rounded-full flex items-center justify-center transition-all duration-500 ${sequenceComplete && !isCompleted ? 'scale-100 opacity-100' : 'scale-90 opacity-50 grayscale'}`}
                    disabled={!sequenceComplete || isCompleted}
                    onClick={() => {
                      if (sequenceComplete && !isCompleted && !cameraOpen && !vision.isAnalyzing) {
                        setCameraOpen(true);
                      }
                    }}
                  >
                    <div className={`absolute inset-0 rounded-full blur-md transition-all ${sequenceComplete && !isCompleted ? 'bg-neon-pink/30 group-hover:bg-neon-pink/50 animate-pulse' : 'bg-primary/20'}`}></div>
                    <div className={`relative size-20 rounded-full border-2 border-white/20 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform ${sequenceComplete && !isCompleted ? 'bg-gradient-to-br from-neon-pink to-primary' : 'bg-gradient-to-br from-primary to-purple-900'}`}>
                      <span className="material-symbols-outlined text-white text-[40px]">{sequenceComplete && !isCompleted ? 'photo_camera' : 'filter_center_focus'}</span>
                    </div>
                  </button>
                </div>
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
        );
      }}
    </StageWrapper>
  );
};

export default Stage13Mushrooms;
