import React, { useState } from 'react';
import StageWrapper from '../components/StageWrapper';
import CameraCapture from '../components/CameraCapture';
import { useGeminiVision } from '../lib/useGeminiVision';

const RIDDLE_TEXT =
  'In a realm of miniature worlds, a royal couple gazes not at each other but at their reflection. Find the prince of Jasrota and his beloved, caught forever in their looking glass.';

const Stage08Gallery: React.FC = () => {
  const [riddleSolved, setRiddleSolved] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const vision = useGeminiVision({
    referenceImagePath: '/artGallery.jpg',
    matchPrompt:
      'Does this photo show an Indian miniature painting of a prince and wife before a mirror?',
  });

  return (
    <StageWrapper stageId={8}>
      {({ onComplete, isCompleted }) => {
        const matched = vision.result?.isMatch ?? false;
        const isActuallyDone = isCompleted || matched;

        const handleCapture = async (base64: string) => {
          setCameraActive(false);
          await vision.analyze(base64);
        };

        if (matched && !isCompleted) {
          setTimeout(() => onComplete(), 1200);
        }

        return (
          <div className="flex flex-col items-center min-h-[70vh] p-6 relative">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10 rounded-lg pointer-events-none"
              style={{
                backgroundImage:
                  "url('https://www.transparenttextures.com/patterns/cubes.png')",
              }}
            />

            <div className="relative z-10 w-full max-w-md space-y-8">
              {/* Stage Label */}
              <div className="text-center">
                <span className="text-[10px] font-mono text-acid tracking-widest uppercase">
                  Gallery_Search_08
                </span>
                <h1 className="text-xl font-bold uppercase tracking-widest text-white">
                  GALLERY SEARCH
                </h1>
              </div>

              {/* Intel Card */}
              <div className="bg-black/40 border border-solar/20 rounded-lg p-3">
                <p className="text-[10px] font-mono text-solar uppercase tracking-widest mb-1">Intel</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  The next clue is buried within the <span className="text-solar font-bold">Sediment of Time</span> at the Museum. A <span className="text-primary font-bold">riddle fragment</span> points to a specific painting — find it and <span className="text-acid font-bold">photograph</span> it to extract the shard.
                </p>
              </div>

              {!cameraActive ? (
                <>
                  {/* Riddle Card */}
                  <div className="bg-[#151018] border border-solar/30 rounded-xl p-6 shadow-[0_0_20px_rgba(255,182,34,0.1)]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-solar text-lg">
                        auto_stories
                      </span>
                      <p className="text-solar text-xs font-bold tracking-[0.2em] uppercase">
                        Riddle Fragment
                      </p>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed font-mono italic">
                      &quot;{RIDDLE_TEXT}&quot;
                    </p>
                    <div className="mt-4 flex justify-between text-[10px] font-mono text-white/30">
                      <span>SRC: ARCHIVE_NODE_08</span>
                      <span>ENC: SOLAR-256</span>
                    </div>
                  </div>

                  {/* Frame reveal animation for matched state */}
                  {isActuallyDone ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-full aspect-[4/3] border-[8px] border-solar/40 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,182,34,0.3)]">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className="material-symbols-outlined text-acid text-5xl mb-2">
                              verified
                            </span>
                            <p className="text-acid font-mono text-sm tracking-widest animate-pulse">
                              PAINTING VERIFIED
                            </p>
                            <p className="text-white/50 text-xs font-mono mt-1">
                              {vision.result?.description ?? 'Match confirmed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Hint visual */}
                      <div className="flex justify-center">
                        <div className="relative w-48 h-64 border-2 border-primary/30 rounded-lg flex items-center justify-center bg-black/40">
                          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-solar" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-solar" />
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-solar" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-solar" />
                          <span className="material-symbols-outlined text-primary/40 text-6xl">
                            image_search
                          </span>
                        </div>
                      </div>

                      {/* I Found It Button */}
                      <button
                        onClick={() => {
                          setRiddleSolved(true);
                          setCameraActive(true);
                        }}
                        className="w-full py-4 bg-primary text-white font-bold rounded-xl tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(174,62,254,0.4)] active:scale-95 transition-all"
                      >
                        I FOUND IT
                      </button>
                    </>
                  )}

                  {/* Error state */}
                  {vision.result && !vision.result.isMatch && (
                    <div className="text-center space-y-2">
                      <p className="text-secondary font-mono text-xs">
                        That doesn&apos;t look right. Try again.
                      </p>
                      <button
                        onClick={() => {
                          vision.reset();
                          setCameraActive(true);
                        }}
                        className="text-primary text-xs underline"
                      >
                        Retry Camera
                      </button>
                    </div>
                  )}

                  {vision.error && (
                    <div className="text-center space-y-2">
                      <p className="text-red-400 font-mono text-xs">{vision.error}</p>
                      <button
                        onClick={() => {
                          vision.reset();
                          setCameraActive(true);
                        }}
                        className="text-primary text-xs underline"
                      >
                        Try Again
                      </button>
                      {vision.quotaExhausted && (
                        <button
                          onClick={() => vision.manualConfirm()}
                          className="mt-2 px-6 py-3 bg-solar/20 border border-solar/50 text-solar font-bold rounded-lg tracking-wider text-sm shadow-[0_0_15px_rgba(255,182,34,0.3)] active:scale-95 transition-transform"
                        >
                          CONFIRM MANUALLY
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Camera Mode */
                <div className="space-y-4">
                  <CameraCapture
                    isActive={true}
                    onCapture={handleCapture}
                    onClose={() => setCameraActive(false)}
                  >
                    {/* Frame overlay */}
                    <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-solar" />
                    <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-solar" />
                    <div className="absolute bottom-24 left-6 w-10 h-10 border-b-2 border-l-2 border-solar" />
                    <div className="absolute bottom-24 right-6 w-10 h-10 border-b-2 border-r-2 border-solar" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <p className="text-solar/60 text-[10px] font-mono tracking-widest bg-black/40 px-2 py-1 rounded">
                        ALIGN WITH PAINTING
                      </p>
                    </div>
                  </CameraCapture>

                  {vision.isAnalyzing && (
                    <div className="text-center">
                      <p className="text-solar font-mono text-xs tracking-widest animate-pulse">
                        ANALYZING ARTWORK...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex justify-between items-center opacity-40 pt-4">
                <span className="text-[8px] font-mono tracking-widest uppercase">
                  Gallery: Asian Art Wing
                </span>
                <span className="text-[8px] font-mono tracking-widest uppercase">
                  {isActuallyDone ? 'VERIFIED' : riddleSolved ? 'SCANNING' : 'RIDDLE_ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        );
      }}
    </StageWrapper>
  );
};

export default Stage08Gallery;
