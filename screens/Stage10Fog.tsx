import React, { useState, useRef, useEffect } from 'react';
import StageWrapper from '../components/StageWrapper';

const TARGET_TIME = new Date('2026-02-14T16:00:00-05:00').getTime();

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = TARGET_TIME - Date.now();
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const diff = TARGET_TIME - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const isExpired = timeLeft <= 0;

  return { hours, minutes, seconds, isExpired };
}

const Stage10Fog: React.FC = () => {
  const [tapCount, setTapCount] = useState(0);
  const [cleansed, setCleansed] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const openAudioRef = useRef<HTMLAudioElement | null>(null);
  const solveAudioRef = useRef<HTMLAudioElement | null>(null);
  const { hours, minutes, seconds, isExpired } = useCountdown();

  const fogOpacity = Math.max(0, 1 - tapCount / 5);

  useEffect(() => {
    openAudioRef.current = new Audio('/fog-ambient.mp3');
    solveAudioRef.current = new Audio('/fog-cleared.mp3');
    openAudioRef.current.loop = true;

    // Attempt auto-play
    openAudioRef.current.play()
      .then(() => setAudioStarted(true))
      .catch(() => {
        // Autoplay blocked — will start on first user interaction
      });

    return () => {
      openAudioRef.current?.pause();
      solveAudioRef.current?.pause();
      openAudioRef.current = null;
      solveAudioRef.current = null;
    };
  }, []);

  // Fallback: start audio on first user interaction if autoplay was blocked
  useEffect(() => {
    if (audioStarted) return;
    const startOnInteraction = () => {
      if (!audioStarted && openAudioRef.current) {
        openAudioRef.current.play().catch(() => { });
        setAudioStarted(true);
      }
    };
    window.addEventListener('click', startOnInteraction, { once: true });
    window.addEventListener('touchstart', startOnInteraction, { once: true });
    return () => {
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);
    };
  }, [audioStarted]);

  const startOpenAudio = () => {
    if (!audioStarted && openAudioRef.current) {
      openAudioRef.current.play().catch(() => {/* autoplay blocked */ });
      setAudioStarted(true);
    }
  };

  const handleTap = (onComplete: () => void) => {
    if (cleansed) return;
    startOpenAudio();
    setTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setCleansed(true);
        // Stop open audio, play solve audio
        openAudioRef.current?.pause();
        if (solveAudioRef.current) {
          solveAudioRef.current.play().catch(() => {/* autoplay blocked */ });
        }
        setTimeout(() => {
          onComplete();
        }, 0);
      }
      return newCount;
    });
  };

  return (
    <StageWrapper stageId={10}>
      {({ onComplete, isCompleted }) => (
        <div className="bg-background-light dark:bg-background-dark font-display antialiased min-h-[70vh] overflow-hidden flex flex-col relative text-white rounded-lg">
          {/* AR Camera Feed */}
          <div className="absolute inset-0 z-0 bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNz5S_jepdlK745z-NgL0EdV20EwwPv7oHoUGpAukPsq0qXCGYAZXz9Lif1KLIGhnnvmYNEOQ5NJOtgiX53MfMdlXEgA82jUpU6CIAU3XxDo_mJvgIm4lm3OVXSUct6al_TBDBTeF235YlWHJklSTaBlnX6vTyqe1YJb3HeXmWm8TNaAvgzNktSn93-Bd4iUw6jJwZj2_Wx5_Ip7xNOfCcz2r1gv2oJiV_OQvCZQ6bUdWGk4vaO5H9iVLXFprmjHpoSZGe-45jpSaF')" }}>
            <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
          </div>

          {/* Fog Layer */}
          <div
            className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-700"
            style={{ opacity: isCompleted ? 0 : fogOpacity }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(88,28,135,0.4)_40%,rgba(27,15,35,0.95)_100%)]"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-60 mix-blend-hard-light" style={{ animation: 'pulse 10s ease-in-out infinite' }}>
              <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[url('https://images.unsplash.com/photo-1536532184021-da4272366502?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center filter blur-xl"></div>
            </div>
          </div>

          <div className="relative z-20 flex flex-col min-h-[70vh] justify-between pointer-events-none">
            {/* Header */}
            <div className="pointer-events-auto pt-6 px-4 pb-4 bg-gradient-to-b from-background-dark/90 to-transparent">
              <div className="flex items-center justify-center">
                <div className="text-center mx-4">
                  <h2 className="text-xs font-bold text-primary tracking-widest uppercase mb-1 drop-shadow-[0_0_10px_rgba(174,62,254,0.8)]">Protocol Active</h2>
                  <h1 className="text-white text-lg font-bold leading-tight tracking-wide drop-shadow-md">STAGE 10: FOG</h1>
                </div>
              </div>
              <div className="mt-4 flex gap-1 h-1 w-full opacity-80">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-full transition-all duration-500 ${i < tapCount || isCompleted ? 'bg-primary shadow-[0_0_10px_#ae3efe]' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </div>

            {/* Center Interaction Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {(cleansed || isCompleted) ? (
                <div className="text-center animate-pulse">
                  <span className="material-symbols-outlined text-6xl text-acid mb-4 block drop-shadow-[0_0_30px_rgba(246,255,0,0.8)]">check_circle</span>
                  <p className="text-acid text-2xl font-bold tracking-[0.3em] drop-shadow-[0_0_20px_rgba(246,255,0,0.8)]">AREA CLEANSED</p>
                </div>
              ) : (
                <>
                  <div className="w-64 h-64 border border-white/20 rounded-full flex items-center justify-center relative animate-pulse">
                    <div className="absolute inset-0 border-t-2 border-l-2 border-primary/50 rounded-full w-full h-full animate-spin-slow"></div>
                    <div className="absolute inset-4 border-b-2 border-r-2 border-acid/50 rounded-full w-[calc(100%-2rem)] h-[calc(100%-2rem)] animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                    <button
                      onClick={() => handleTap(onComplete)}
                      className="pointer-events-auto group relative w-20 h-20 bg-black/40 backdrop-blur-sm rounded-full border-2 border-white/30 flex items-center justify-center overflow-hidden transition-all duration-300 active:scale-95 active:border-primary"
                    >
                      <span className="material-symbols-outlined text-3xl text-white group-active:text-primary transition-colors">filter_tilt_shift</span>
                      <span className="absolute inset-0 rounded-full animate-ping bg-white/10"></span>
                    </button>
                  </div>
                  <div className="mt-8 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-acid text-sm animate-bounce">touch_app</span>
                    <span className="text-xs font-medium uppercase tracking-wider text-white/90">Knock to cleanse area ({5 - tapCount} remaining)</span>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="pointer-events-auto p-4 pb-8 bg-gradient-to-t from-background-dark to-transparent">
              <div className="mb-6 mx-4 bg-surface-dark/90 backdrop-blur-xl border border-primary/30 rounded-lg p-4 shadow-[0_0_30px_-5px_rgba(174,62,254,0.3)] flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-acid to-transparent opacity-50"></div>
                <h3 className="text-primary/80 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">T-Minus to 4:00 PM</h3>
                <div className="flex items-end gap-2 font-mono text-acid drop-shadow-[0_0_8px_rgba(246,255,0,0.6)]">
                  <div className="flex flex-col items-center"><span className="text-4xl font-bold leading-none">{isExpired ? '00' : hours}</span><span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Hrs</span></div>
                  <span className="text-2xl font-bold mb-4 text-white/40">:</span>
                  <div className="flex flex-col items-center"><span className="text-4xl font-bold leading-none">{isExpired ? '00' : minutes}</span><span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Min</span></div>
                  <span className="text-2xl font-bold mb-4 text-white/40">:</span>
                  <div className="flex flex-col items-center"><span className="text-4xl font-bold leading-none">{isExpired ? '00' : seconds}</span><span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Sec</span></div>
                </div>
                {isExpired && <p className="text-secondary text-[10px] font-mono mt-2 tracking-widest">FOG PROTOCOL ACTIVE</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </StageWrapper>
  );
};

export default Stage10Fog;
