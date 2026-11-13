import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StageWrapper from '../components/StageWrapper';
import CameraCapture from '../components/CameraCapture';
import { useGeminiVision } from '../lib/useGeminiVision';
import { useGame } from '../lib/GameContext';

const Stage02Hive: React.FC = () => {
  const navigate = useNavigate();
  const [cameraOpen, setCameraOpen] = useState(false);
  const completedRef = useRef(false);
  const { collectItem } = useGame(); // Added useGame hook

  const vision = useGeminiVision({
    referenceImagePath: '/sleepyBeeFlowers.webp',
    matchPrompt: 'Does this photo show flowers or a floral chandelier at the Sleepy Bee Cafe? Look for colorful flowers, a floral display, or the distinctive Sleepy Bee decor.',
  });

  const handleCapture = (base64: string) => {
    setCameraOpen(false);
    vision.analyze(base64);
  };

  return (
    <StageWrapper stageId={2} customLayout inlineClue>
      {({ onComplete, isCompleted, cluePanelNode }) => {
        if (vision.result?.isMatch && !isCompleted && !completedRef.current) {
          completedRef.current = true;
          // Added collectItem call here, as this is where the "match" is confirmed and completion is triggered.
          collectItem('Citrine');
          collectItem('Glass Flower Chandelier');
          setTimeout(() => onComplete(), 500);
        }

        const matchFound = vision.result?.isMatch || isCompleted;

        return (
          <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-y-auto min-h-screen flex flex-col relative w-full">
            {/* Background Camera Feed Simulation */}
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAz6IWDLQGZRsYFy4CIAnYUrDwzcgFbUOqQMqeuOLWj8oa-yeHLNfisbgxPl--LHsKs-IvdMzl0cu9cqvpJHwQWk2CacL0-7aGQQ9Y6kgQYY9Sr0w1TtsNrDNfP-X9T9-I1aCQ8gkvMvKV2rMikDtqwSLDXUh9-VDEbvQw1I0hndmDKivIR1fuyR9zXpTDN0O5U5L2HJbUxHQRRV3wSSV6nFvmbDwbi9BZ10Bajr9wY2MgVqASJMH49XfKjwgx11Ucm9M1oM1eeD-db')", filter: "contrast(1.2) brightness(0.6) saturate(1.2)" }}>
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))", backgroundSize: "100% 2px, 3px 100%" }}></div>
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.5))] bg-[length:100%_4px]"></div>
            <div className="scanline"></div>

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/90 to-transparent">
              <button onClick={() => navigate('/')} className="flex items-center justify-center size-10 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 active:bg-primary transition-colors">
                <span className="material-symbols-outlined text-2xl">arrow_back</span>
              </button>
              <div className="flex flex-col items-center flex-1 mx-4">
                <h2 className="text-white text-sm font-bold tracking-widest uppercase shadow-sm">Stage 02: The Hive</h2>
                <div className="flex items-center gap-2">
                  <div className={`size-1.5 rounded-full ${matchFound ? 'bg-primary' : 'bg-green-500'} animate-pulse`}></div>
                  <span className="text-xs text-primary font-mono tracking-widest">
                    {matchFound ? 'MATCH LOCKED' : vision.isAnalyzing ? 'ANALYZING...' : 'PROTOCOL ACTIVE'}
                  </span>
                </div>
              </div>
              <button className="flex items-center justify-center size-10 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10">
                <span className="material-symbols-outlined text-2xl">settings</span>
              </button>
            </header>

            {/* Main Viewfinder Area */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
              {cameraOpen ? (
                <CameraCapture
                  isActive={cameraOpen}
                  onCapture={handleCapture}
                  onClose={() => setCameraOpen(false)}
                >
                  {/* AR Corner Brackets */}
                  <div className="absolute inset-4">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-pink"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-solar"></div>
                  </div>
                </CameraCapture>
              ) : (
                <>
                  {/* Target Reticle */}
                  <div className="relative size-72 sm:size-80 border border-primary/30 rounded-lg flex items-center justify-center group">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-cyan -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-pink -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-solar -mb-1 -mr-1"></div>

                    <div className={`absolute inset-4 border border-white/10 rounded-full flex items-center justify-center ${vision.isAnalyzing ? 'animate-spin' : 'animate-spin-slow'}`}>
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                      <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent absolute"></div>
                    </div>

                    <div className={`size-12 rounded-full border-2 ${matchFound ? 'border-primary bg-primary/20' : 'border-white/50 bg-white/5'} backdrop-blur-sm flex items-center justify-center ${!matchFound ? 'animate-pulse' : ''}`}>
                      {matchFound ? (
                        <span className="material-symbols-outlined text-primary text-xl">check</span>
                      ) : (
                        <div className="size-1 rounded-full bg-secondary shadow-[0_0_10px_#ffb622]"></div>
                      )}
                    </div>

                    {matchFound && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded border border-primary/50">
                          <p className="text-primary font-mono text-lg font-bold tracking-widest animate-pulse" style={{ textShadow: "0 0 10px rgba(174, 62, 254, 0.8)" }}>MATCH FOUND</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute -right-16 top-10 text-[10px] font-mono text-neon-cyan opacity-80">
                      <div>DST: 2.4m</div>
                      <div>LUM: 480lx</div>
                    </div>
                    <div className="absolute -left-16 bottom-10 text-[10px] font-mono text-neon-pink opacity-80 text-right">
                      <div>ISO: 800</div>
                      <div>SHUT: 1/60</div>
                    </div>
                  </div>
                </>
              )}

              {/* Intel Card */}
              <div className="mt-4 w-full max-w-sm bg-black/40 border border-primary/20 rounded-lg p-3">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Intel</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  The Syndicate has stashed a <span className="text-secondary font-bold">crystal shard</span> within the Honeystore. There is word the location has a chromatic <span className="text-acid font-bold">floral chandelier</span>. Photograph the <span className="text-acid font-bold">floral chandelier</span> to capture the evidence and extract the crystal.
                </p>
              </div>

              {/* System Message */}
              <div className="mt-8 px-6 py-3 bg-black/60 backdrop-blur-md border border-solar/30 rounded-lg max-w-sm text-center shadow-[0_0_15px_rgba(255,182,34,0.1)]">
                <h2 className="text-solar font-bold text-sm sm:text-base leading-tight tracking-wider font-mono animate-pulse" style={{ textShadow: "0 0 5px rgba(255, 182, 34, 0.6)" }}>
                  {isCompleted ? 'KILN-FORMED FREQUENCY MATCHED. EVIDENCE CAPTURED.' :
                    matchFound ? 'MATCH CONFIRMED. LOCKING SIGNAL...' :
                      vision.isAnalyzing ? 'SCANNING KILN-FORMED FREQUENCY...' :
                        vision.error ? 'SCAN FAILED. TRY AGAIN.' :
                          vision.result && !vision.result.isMatch ? 'NO MATCH. PHOTOGRAPH THE FLORAL CHANDELIER.' :
                            'CAPTURE THE CHROMATIC EVIDENCE.'}
                </h2>
              </div>

              {vision.error && (
                <p className="mt-2 text-xs text-red-400 font-mono text-center">{vision.error}</p>
              )}

              {vision.quotaExhausted && (
                <button
                  onClick={() => vision.manualConfirm()}
                  className="mt-3 px-6 py-3 bg-solar/20 border border-solar/50 text-solar font-bold rounded-lg tracking-wider text-sm shadow-[0_0_15px_rgba(255,182,34,0.3)] active:scale-95 transition-transform"
                >
                  CONFIRM MANUALLY
                </button>
              )}

              {cluePanelNode && <div className="mt-4 w-full max-w-md relative z-30">{cluePanelNode}</div>}
            </main>

            {/* Bottom Controls */}
            <footer className="relative z-20 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-8 px-6">
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-end">
                  <p className="text-white text-xs font-bold tracking-widest uppercase">Spectral Analysis</p>
                  <p className="text-neon-pink text-xs font-mono font-bold">
                    {matchFound ? '100% MATCH' : vision.isAnalyzing ? 'ANALYZING...' : '0% MATCH'}
                  </p>
                </div>
                <div className="h-4 rounded-sm bg-[#2a1f33] border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, #fff 2px, #fff 4px)" }}></div>
                  <div className="h-full rounded-sm bg-rainbow-grit relative transition-all duration-500" style={{ width: matchFound ? '100%' : vision.isAnalyzing ? '60%' : '0%', boxShadow: "0 0 15px rgba(174, 62, 254, 0.6)" }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full animate-shimmer"></div>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>SPECTRUM: NEON_V2</span>
                  <span>DATA_BLOCK: #A4F9</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6">
                <button className="flex shrink-0 items-center justify-center rounded-full size-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">imagesmode</span>
                </button>

                <button
                  onClick={() => !isCompleted && !matchFound && !vision.isAnalyzing && setCameraOpen(true)}
                  disabled={isCompleted || !!matchFound || vision.isAnalyzing || cameraOpen}
                  className={`flex shrink-0 items-center justify-center rounded-full size-20 border-2 text-white transition-all group relative overflow-hidden ${isCompleted || matchFound
                    ? 'bg-primary/10 border-primary/40 cursor-not-allowed'
                    : vision.isAnalyzing
                      ? 'bg-gradient-to-br from-primary/30 to-black border-primary animate-pulse cursor-wait'
                      : 'bg-gradient-to-br from-primary/20 to-black border-primary shadow-[0_0_20px_rgba(174,62,254,0.4)] hover:shadow-[0_0_30px_rgba(174,62,254,0.6)] active:scale-95'
                    }`}
                >
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                  <span className="material-symbols-outlined text-4xl relative z-10 group-hover:text-neon-cyan transition-colors">
                    {isCompleted || matchFound ? 'check_circle' : 'camera'}
                  </span>
                </button>

                <button className="flex shrink-0 items-center justify-center rounded-full size-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">filter_tilt_shift</span>
                </button>
              </div>
              <div className="h-4 w-full"></div>
            </footer>
          </div>
        );
      }}
    </StageWrapper>
  );
};

export default Stage02Hive;
