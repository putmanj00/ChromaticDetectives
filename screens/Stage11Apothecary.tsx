import React, { useState } from 'react';
import StageWrapper from '../components/StageWrapper';
import VideoInterstitial from '../components/VideoInterstitial';

const VOLUME_TARGET = 72;
const TEMP_TARGET = 14;
const VOL_TOLERANCE = 3;
const TEMP_TOLERANCE = 2;

const Stage11Apothecary: React.FC = () => {
  const [volume, setVolume] = useState(50);
  const [temp, setTemp] = useState(25);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const [isStabilized, setIsStabilized] = useState(false);
  const [showPostVideo, setShowPostVideo] = useState(false);

  const isVolumeCorrect = Math.abs(volume - VOLUME_TARGET) <= VOL_TOLERANCE;
  const isTempCorrect = Math.abs(temp - TEMP_TARGET) <= TEMP_TOLERANCE;
  const isAligned = isVolumeCorrect && isTempCorrect;

  const handleSynthesize = () => {
    if (isStabilized) return;

    setIsSynthesizing(true);

    setTimeout(() => {
      setIsSynthesizing(false);
      if (isAligned) {
        setIsStabilized(true);
        setTimeout(() => setShowPostVideo(true), 1500);
      } else {
        setErrorFlash(true);
        setTimeout(() => setErrorFlash(false), 500);
      }
    }, 1000);
  };

  const getLiquidColor = () => {
    if (isStabilized) return '#ae3efe';
    if (isAligned) return '#7b2ff7';
    const tempNorm = (temp - 1) / 49;
    const hue = 240 - tempNorm * 240;
    const volDist = Math.abs(volume - VOLUME_TARGET) / 50;
    const saturation = Math.max(30, 100 - volDist * 70);
    const lightness = Math.max(20, 45 - volDist * 20);
    return isSynthesizing ? '#f53fe8' : `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <StageWrapper stageId={11}>
      {({ onComplete, isCompleted }) => {
        const isActuallyDone = isCompleted || isStabilized;

        if (showPostVideo) {
          return (
            <VideoInterstitial
              src="/Detective_Movie_Preview_Creation2.mp4"
              onComplete={() => {
                setShowPostVideo(false);
                onComplete();
              }}
              title="MEMORY RECOVERED"
            />
          );
        }

        return (
          <div className="flex flex-col items-center min-h-[70vh] relative">
            {/* Radial gradient background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(174,62,254,0.2),transparent_70%)] pointer-events-none" />

            {/* Intel Card */}
            <div className="w-full max-w-sm mx-auto mt-2 mb-4 px-2">
              <div className="bg-black/40 border border-primary/20 rounded-lg p-3">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Intel</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  This space is contaminated by <span className="text-secondary font-bold">Chromic Acid</span> from the Syndicate&apos;s bioluminescent fog. Neutralize the atmosphere by performing a <span className="text-acid font-bold">Compound Synthesis</span>.
                </p>
              </div>
            </div>

            {/* Instruction */}
            <p className="text-[10px] font-mono text-acid/80 uppercase tracking-[0.15em] text-center mb-4 px-4">
              Adjust mixture to synthesize the compound and cleanse the safehouse
            </p>

            {/* Flask Visual */}
            <div className="relative w-40 h-56 mb-8">
              {/* Flask neck */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-8 bg-white/5 border-x-2 border-t-2 border-white/20 rounded-t-lg z-10" />
              {/* Flask body */}
              <div className="absolute top-6 inset-x-0 bottom-0 rounded-full bg-white/5 backdrop-blur-sm border-2 border-white/20 overflow-hidden">
                {/* Measurement marks */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 pointer-events-none z-10 opacity-20">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-px bg-white ${i % 2 === 0 ? 'w-full' : 'w-1/2 ml-auto'}`} />
                  ))}
                </div>

                {/* Liquid fill */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                  style={{
                    height: `${volume}%`,
                    backgroundColor: getLiquidColor(),
                    boxShadow: isAligned ? `0 0 40px ${getLiquidColor()}88, inset 0 0 20px ${getLiquidColor()}44` : 'none'
                  }}
                >
                  {/* Surface highlight */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-white/20 -translate-y-1/2 blur-sm" />

                  {/* Bubbles */}
                  {!isActuallyDone && (
                    <>
                      <div className="absolute bottom-2 left-4 w-3 h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
                      <div className="absolute bottom-4 right-6 w-2 h-2 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
                      <div className="absolute bottom-1 left-1/2 w-2.5 h-2.5 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
                      <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.2s' }} />
                    </>
                  )}

                  {/* Synthesis pulse */}
                  {isSynthesizing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-ping size-12 bg-white/30 rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status indicators */}
              <div className="absolute -right-20 top-1/3 flex flex-col gap-2">
                <div className={`px-2 py-1 rounded border text-[8px] font-mono transition-colors ${isVolumeCorrect ? 'bg-primary/20 border-primary text-primary shadow-[0_0_8px_rgba(174,62,254,0.4)]' : 'bg-black/40 border-white/10 text-white/40'}`}>
                  VOL: {isVolumeCorrect ? 'LOCK' : 'MISS'}
                </div>
                <div className={`px-2 py-1 rounded border text-[8px] font-mono transition-colors ${isTempCorrect ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_8px_rgba(245,63,232,0.4)]' : 'bg-black/40 border-white/10 text-white/40'}`}>
                  TMP: {isTempCorrect ? 'LOCK' : 'MISS'}
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className={`w-full max-w-sm bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md transition-all mx-2 ${errorFlash ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}`}>
              <div className="space-y-6">
                {/* Volume Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-mono text-primary uppercase tracking-[0.2em]">Synthesis Volume</label>
                    <span className="text-sm font-bold text-white font-mono">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    disabled={isActuallyDone || isSynthesizing}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                      [&::-webkit-slider-thumb]:shadow-[0_0_15px_#ae3efe] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/30
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                {/* Temperature Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-mono text-secondary uppercase tracking-[0.2em]">Thermal Alignment</label>
                    <span className="text-sm font-bold text-white font-mono">{temp}&deg;C</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={temp}
                    onChange={(e) => setTemp(parseInt(e.target.value))}
                    disabled={isActuallyDone || isSynthesizing}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary
                      [&::-webkit-slider-thumb]:shadow-[0_0_15px_#f53fe8] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/30
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => handleSynthesize()}
                  disabled={isActuallyDone || isSynthesizing}
                  className={`w-full py-4 rounded-xl font-bold tracking-[0.3em] uppercase transition-all ${isActuallyDone
                    ? 'bg-acid/20 text-acid border border-acid/40'
                    : 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_4px_15px_rgba(174,62,254,0.4)] active:scale-95'
                    } disabled:opacity-50`}
                >
                  {isActuallyDone ? 'PROTOCOL_STABILIZED' : isSynthesizing ? 'SYNTHESIZING...' : 'Execute Synthesis'}
                </button>
              </div>

              <div className="mt-4 flex justify-between items-center opacity-40">
                <div className="flex gap-1">
                  <div className={`size-1 rounded-full ${isActuallyDone ? 'bg-acid' : 'bg-white'}`} />
                  <div className={`size-1 rounded-full ${isActuallyDone ? 'bg-acid' : 'bg-white'}`} />
                  <div className={`size-1 rounded-full ${isActuallyDone ? 'bg-acid' : 'bg-white'}`} />
                </div>
                <span className="text-[8px] font-mono tracking-widest uppercase">
                  {isActuallyDone ? 'Alignment Perfect' : 'Precise calibration required'}
                </span>
              </div>
            </div>
          </div>
        );
      }}
    </StageWrapper>
  );
};

export default Stage11Apothecary;
