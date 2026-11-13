import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StageWrapper from '../components/StageWrapper';
import CameraCapture from '../components/CameraCapture';
import { useGeminiVision } from '../lib/useGeminiVision';

// Correct tap order matches the colored words in the clue narrative
const CORRECT_ORDER = [0, 1, 2, 3, 4]; // data_object, view_in_ar, memory, hub, diamond

const BRICK_CONFIGS = [
  { id: 0, top: '30%', left: '20%', duration: '3s', delay: '0s', size: 'w-16 h-16', icon: 'data_object', label: 'GLITCH', borderColor: 'border-[#ae3efe]', bgColor: 'bg-[#ae3efe]/20', shadowColor: 'shadow-[0_0_20px_rgba(174,62,254,0.6)]', textColor: 'text-[#ae3efe]' },
  { id: 1, top: '65%', right: '15%', duration: '4s', delay: '1s', size: 'w-14 h-14', icon: 'view_in_ar', label: 'SCAN', borderColor: 'border-[#f53fe8]', bgColor: 'bg-[#f53fe8]/20', shadowColor: 'shadow-[0_0_20px_rgba(245,63,232,0.6)]', textColor: 'text-[#f53fe8]' },
  { id: 2, top: '45%', right: '25%', duration: '3.5s', delay: '0.5s', size: 'w-14 h-14', icon: 'memory', label: 'CORE', borderColor: 'border-[#00ffff]', bgColor: 'bg-[#00ffff]/20', shadowColor: 'shadow-[0_0_20px_rgba(0,255,255,0.6)]', textColor: 'text-[#00ffff]' },
  { id: 3, top: '78%', left: '30%', duration: '4.5s', delay: '1.5s', size: 'w-12 h-12', icon: 'hub', label: 'LINK', borderColor: 'border-[#ccff00]', bgColor: 'bg-[#ccff00]/20', shadowColor: 'shadow-[0_0_20px_rgba(204,255,0,0.6)]', textColor: 'text-[#ccff00]' },
  { id: 4, top: '25%', right: '10%', duration: '3.2s', delay: '2s', size: 'w-14 h-14', icon: 'diamond', label: 'KEY', borderColor: 'border-[#ffb622]', bgColor: 'bg-[#ffb622]/20', shadowColor: 'shadow-[0_0_20px_rgba(255,182,34,0.6)]', textColor: 'text-[#ffb622]' },
] as const;

const Stage12Lego: React.FC = () => {
  const navigate = useNavigate();
  const [tappedSequence, setTappedSequence] = useState<number[]>([]);
  const [shakeError, setShakeError] = useState(false);
  const [bricksComplete, setBricksComplete] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const completedRef = useRef(false);

  const vision = useGeminiVision({
    matchPrompt: 'Does this photo show Lego bricks, a Lego structure, Lego minifigures, or anything related to Legoland Discovery Center? Look for colorful plastic building blocks or Lego constructions.',
  });

  const collectBrick = (id: number, isCompleted: boolean) => {
    if (isCompleted || bricksComplete || shakeError) return;

    const nextIndex = tappedSequence.length;
    const expectedId = CORRECT_ORDER[nextIndex];

    if (id !== expectedId) {
      // Wrong order — shake and reset
      setShakeError(true);
      setTimeout(() => {
        setShakeError(false);
        setTappedSequence([]);
      }, 600);
      return;
    }

    const next = [...tappedSequence, id];
    setTappedSequence(next);
    if (next.length === 5) {
      setTimeout(() => setBricksComplete(true), 400);
    }
  };

  const handleCapture = (base64: string) => {
    setCameraOpen(false);
    vision.analyze(base64);
  };

  const collectedCount = tappedSequence.length;
  const progressPercent = (collectedCount / 5) * 100;

  return (
    <StageWrapper stageId={12} hideBottomNav>
      {({ onComplete, isCompleted }) => {
        if (vision.result?.isMatch && !isCompleted && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onComplete(), 500);
        }

        return (
          <div className="bg-background-light dark:bg-background-dark font-display antialiased min-h-[calc(100vh-56px)] w-full relative -m-4 overflow-y-auto">
            {/* AR Background Layer */}
            <div className="absolute inset-0 z-0 bg-black">
              <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuANih-yI14PD2W8YG9JPyzzdI5GV_Xd0Ut0y-uYhlP36M1m-mG9z7dwng7U_GVbVHDvcPVWNl8lhclmxVXyazP7VwBZFCQmfSWPwigiuD54izXLyQnbO2QYltefQD7n0ZtRIxawNi1koIFOC11VIYtqBb5InKhvmH1Yj--Ne-5tYicN1B6UlStnfqPEq85o5ccbrtD-jHN06mTP83RHJl106KTSNBC8cm2TRfMp5fLLIp9sAE186wnADpo67lPZ9ftAeJqL6Z-J7Krj')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#1b0f23]/90 via-transparent to-[#1b0f23]/90"></div>
              <div className="absolute inset-0 bg-[length:40px_40px] pointer-events-none opacity-20" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)" }}></div>
              <div className="scanline"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
              {/* Header */}
              <div className="bg-[#151018]/90 backdrop-blur-md p-4 pt-6 pb-2 pointer-events-auto border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-white text-xs font-bold tracking-[0.2em] text-neon-cyan opacity-80">PROTOCOL_14 // STAGE_12</h2>
                      <h1 className="text-white text-xl font-bold leading-tight tracking-tight mt-0.5">THE MASTER BUILDER</h1>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-neon-pink"></div>
                      <span className="text-neon-pink text-xs font-bold tracking-widest">LIVE FEED</span>
                    </div>
                    <span className="text-white/40 text-[10px] font-mono mt-1">LAT: 34.0522 N</span>
                  </div>
                </div>

                {/* Color-coded clue narrative */}
                {!bricksComplete && !isCompleted && (
                  <div className="mt-2 bg-black/40 border border-primary/20 rounded-lg p-3 mb-2">
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Intel</p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      The Editor has hidden <span className="font-bold text-[#ae3efe]">Glitch</span> Bricks in the gallery.
                      {' '}<span className="font-bold text-[#f53fe8]">Scan</span> the bricks emitting the
                      {' '}<span className="font-bold text-[#00ffff]">Core</span> frequency in your HUD to
                      {' '}<span className="font-bold text-[#ccff00]">Link</span> the
                      {' '}<span className="font-bold text-[#ffb622]">Key</span> data.
                    </p>
                    <p className="text-[9px] text-white/40 font-mono mt-1">FOLLOW THE CHROMATIC PATTERN</p>
                  </div>
                )}

                <div className="bg-white/5 rounded border border-white/10 p-3">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-white text-sm font-medium tracking-wide">
                      {bricksComplete ? 'VERIFICATION PHASE' : 'FRAGMENTS COLLECTED'}
                    </span>
                    <span className="text-2xl font-bold text-white leading-none">
                      {bricksComplete ? (
                        <span className="text-neon-cyan text-lg">{vision.isAnalyzing ? 'SCANNING...' : isCompleted ? 'VERIFIED' : 'VERIFY'}</span>
                      ) : (
                        <>{collectedCount}<span className="text-white/40 text-lg">/5</span></>
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#2a1f33] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-neon-pink rounded-full shadow-[0_0_10px_rgba(174,62,254,0.5)] transition-all duration-500"
                      style={{ width: `${isCompleted ? 100 : bricksComplete ? (vision.result?.isMatch ? 100 : 80) : progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-neon-cyan font-mono">
                      {isCompleted ? 'DE-GLITCH COMPLETE' : bricksComplete ? 'PHOTOGRAPH LEGO BUILD TO VERIFY' : 'DE-GLITCH SEQUENCE ACTIVE...'}
                    </span>
                    <span className="text-[10px] text-white/50 font-mono">{isCompleted ? 100 : bricksComplete ? 80 : progressPercent}%</span>
                  </div>
                </div>
              </div>

              {/* AR Interactive Area OR Camera */}
              <div className={`flex-1 relative w-full pointer-events-auto ${shakeError ? 'animate-shake' : ''}`}>
                {bricksComplete && !isCompleted ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-4">
                    {cameraOpen ? (
                      <CameraCapture
                        isActive={cameraOpen}
                        onCapture={handleCapture}
                        onClose={() => setCameraOpen(false)}
                      >
                        <div className="absolute inset-4">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-cyan"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-cyan"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-cyan"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-cyan"></div>
                        </div>
                      </CameraCapture>
                    ) : vision.isAnalyzing ? (
                      <>
                        <div className="size-20 rounded-full border-4 border-primary/40 flex items-center justify-center animate-pulse">
                          <span className="material-symbols-outlined text-4xl text-primary animate-spin">settings</span>
                        </div>
                        <p className="text-neon-cyan font-mono text-sm tracking-widest">ANALYZING CAPTURE...</p>
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
                        <p className="text-neon-pink font-mono text-sm tracking-widest">NO MATCH - TRY AGAIN</p>
                        <button
                          onClick={() => { vision.reset(); setCameraOpen(true); }}
                          className="px-6 py-3 bg-primary text-white font-bold rounded-lg tracking-wider shadow-[0_0_20px_rgba(174,62,254,0.4)] active:scale-95 transition-transform"
                        >
                          RETRY SCAN
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="size-24 rounded-full border-2 border-neon-cyan/50 bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer active:scale-95 transition-transform" onClick={() => setCameraOpen(true)}>
                          <span className="material-symbols-outlined text-5xl text-neon-cyan">photo_camera</span>
                        </div>
                        <div className="text-center">
                          <p className="text-white text-lg font-bold mb-1">ALL FRAGMENTS COLLECTED</p>
                          <p className="text-neon-cyan font-mono text-xs tracking-widest">TAP CAMERA TO VERIFY YOUR LEGO BUILD</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Central Reticle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-64 h-64 border border-white/20 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-neon-cyan"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-neon-cyan"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-neon-cyan"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-neon-cyan"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-neon-pink rounded-full opacity-50"></div>
                      </div>
                    </div>

                    {/* Floating Bricks */}
                    {BRICK_CONFIGS.map(brick => {
                      const collected = tappedSequence.includes(brick.id);
                      return (
                        <button
                          key={brick.id}
                          onClick={() => collectBrick(brick.id, isCompleted)}
                          className={`absolute group focus:outline-none transition-all duration-500 ${collected ? 'scale-0 opacity-0 pointer-events-none' : 'animate-bounce'}`}
                          style={{
                            top: brick.top,
                            left: 'left' in brick ? (brick as { left: string }).left : undefined,
                            right: 'right' in brick ? (brick as { right: string }).right : undefined,
                            animationDuration: brick.duration,
                            animationDelay: brick.delay,
                          } as React.CSSProperties}
                        >
                          <div className={`relative ${brick.size} ${brick.bgColor} backdrop-blur-sm border-2 ${brick.borderColor} rounded-lg flex items-center justify-center transform transition-transform group-active:scale-90 ${brick.shadowColor}`}>
                            <span className={`material-symbols-outlined text-white text-2xl group-hover:animate-spin`}>{brick.icon}</span>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                          </div>
                          <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-black/80 px-2 py-0.5 rounded ${brick.textColor} font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>{brick.label}</div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#151018]/95 backdrop-blur-md border-t border-white/10 pt-3 pb-8 px-5 pointer-events-auto">
                <div className="text-center mb-4">
                  <p className="text-white text-sm font-medium bg-black/50 inline-block px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-sm align-middle mr-1 text-neon-cyan">touch_app</span>
                    {isCompleted ? 'All memory fragments stabilized!' : bricksComplete ? 'Verify your build with the scanner' : shakeError ? 'Wrong order! Follow the order of the spectral colors.' : 'Follow the chromatic pattern'}
                  </p>
                </div>

                <div className="flex justify-between items-center bg-[#251a2d] rounded-2xl p-1.5 shadow-2xl border border-white/5 max-w-md mx-auto mb-2">
                  <button onClick={() => navigate('/items')} className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined text-2xl mb-0.5">inventory_2</span>
                    <span className="text-[10px] font-bold tracking-wider">ITEMS</span>
                  </button>
                  <button
                    onClick={() => { if (bricksComplete && !isCompleted) setCameraOpen(true); }}
                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl relative -mt-8 h-20 border-4 border-[#151018] transition-all ${bricksComplete && !isCompleted ? 'bg-primary shadow-lg shadow-primary/30 text-white scale-110' : 'bg-white/10 text-white/30'}`}
                  >
                    <span className="material-symbols-outlined text-3xl mb-0.5">view_in_ar</span>
                    <span className="text-[10px] font-bold tracking-wider">SCAN</span>
                  </button>
                  <button onClick={() => navigate('/map')} className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined text-2xl mb-0.5">map</span>
                    <span className="text-[10px] font-bold tracking-wider">MAP</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </StageWrapper>
  );
};

export default Stage12Lego;
