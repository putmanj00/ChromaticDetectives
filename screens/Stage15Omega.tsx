import React, { useState, useEffect, useRef, useCallback } from 'react';
import StageWrapper from '../components/StageWrapper';

const FINAL_MESSAGE = "14 years of data, fully decoded. Every frequency, every cipher, every moment has led us here. This was about remembering what's special. Remembering why every single year has mattered. I love you so much. Thank you for 14 wonderful years, and I can't wait to go on more adventures with you in the future!.";

const TYPING_SPEED = 45; // ms per character

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

const Stage15Omega: React.FC = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [particles] = useState<ConfettiParticle[]>(() => {
    const colors = ['#f53fe8', '#ac3cfe', '#ffb622', '#fffd42', '#00ffff', '#ff3b7f', '#39ff14'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      size: 4 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 60,
    }));
  });
  const typingRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const startTyping = useCallback(() => {
    setShowMessage(true);
    setDisplayedText('');
    setTypingComplete(false);
    let index = 0;

    const type = () => {
      if (index < FINAL_MESSAGE.length) {
        setDisplayedText(FINAL_MESSAGE.slice(0, index + 1));
        index++;
        typingRef.current = window.setTimeout(type, TYPING_SPEED);
      } else {
        setTypingComplete(true);
        setShowConfetti(true);
      }
    };
    type();
  }, []);

  const skipTyping = useCallback(() => {
    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }
    setDisplayedText(FINAL_MESSAGE);
    setTypingComplete(true);
    setShowConfetti(true);
  }, []);

  useEffect(() => {
    return () => {
      if (typingRef.current) {
        clearTimeout(typingRef.current);
      }
    };
  }, []);

  return (
    <StageWrapper stageId={15}>
      {({ onComplete, isCompleted }) => {
        const handleFinish = () => {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
        };

        // Fire onComplete once typing is done or skipped
        if (typingComplete && !completedRef.current) {
          setTimeout(handleFinish, 800);
        }

        return (
          <div className="relative flex flex-col w-full max-w-md mx-auto overflow-hidden">
            {/* Confetti Overlay */}
            {showConfetti && (
              <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
                {particles.map(p => (
                  <div
                    key={p.id}
                    className="absolute animate-[confettiFall_linear_forwards]"
                    style={{
                      left: `${p.x}%`,
                      top: '-5%',
                      width: `${p.size}px`,
                      height: `${p.size * 1.4}px`,
                      backgroundColor: p.color,
                      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                      animationDuration: `${p.duration}s`,
                      animationDelay: `${p.delay}s`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                      opacity: 0,
                    }}
                  ></div>
                ))}
              </div>
            )}

            <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0Q7yh3UCOppv1XnBgS2thngwIXT79M86he7xTBmDmFZ-w1ngOE_h65eGIu8xiNKMQEPkebNTZaDOfCsR0Vh0haBzp1TuzjPT0jsIePq3agnFP5H7vpkhMAF1wLhcAwxHur4SHrIo2a2N_Z1vjnLPrTPU_VNsYf3ocD9jzi6DuVsZNWym3P8EjzxGLHCT4H1yOTb0-bs_5-QuJZYQt8-VtZBG_bkjyhi2l_ER0DKP9U0bLmup1aIBgq3nXrPMBhUYmId_OWdeHLziw')]"></div>

            <main className="relative z-10 space-y-6">
              {/* Intel Card */}
              <div className="bg-black/40 border border-primary/20 rounded-lg p-3 mx-2">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Intel</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  The <span className="text-primary font-bold">Fade</span> concludes here. Every frequency, cipher, mineral, and memory shard has been collected. All that remains is to defeat <span className="text-secondary font-bold">"The Editor"</span> and retrieve the <span className="text-solar-gold font-bold">Prism Gaze</span>.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-xl bg-black border border-white/10 aspect-video flex items-center justify-center">
                {isPlaying ? (
                  <video
                    ref={videoRef}
                    src="/Video_Generation_Crystal_Finale.mp4"
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    onEnded={() => setIsPlaying(false)}
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAe5srjHARYmANvoaZrX-25eZVxqla_mOIl5Dl-RkA-WEIc0fsnBChBG-BtjjWbgKFS-oBPw03xF59weLmyJqDB96Ayf28sboMwYx8dlbbZvrZymAMoHlZnXDk47tciouafawISCSr3ThB7uSJZh4iNGwoYT0GWucMZbpNIGZOqi0lV2lYzoVjACabvKMiprUcLC55_dARekBjO3eIigurGQl66EGpsZPMWRlZ0UrCkdrf54rTESfFg4ceiWnST8mSfWf7I8r1tTMQB')" }}></div>
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="relative z-20 flex shrink-0 items-center justify-center rounded-full size-20 bg-primary/20 hover:bg-primary/40 text-white border border-primary/50 transition-all backdrop-blur-sm group/btn"
                    >
                      <span className="material-symbols-outlined text-4xl fill-1 group-hover:scale-110 transition-transform">play_arrow</span>
                    </button>
                    <div className="absolute top-3 left-3 z-20 text-[10px] text-white/40 font-mono">REC [00:15:22:04]</div>
                    <div className="absolute bottom-3 right-3 z-20 text-[10px] text-white/40 font-mono italic">HD_ENCODED_V15</div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-4 p-2">
                <div className="flex gap-6 justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-white text-xs font-bold leading-normal tracking-widest uppercase opacity-80">Data Restored</p>
                    <p className="text-primary text-[10px] font-mono leading-normal">ARCHIVE_SUCCESS_SEQUENCE_COMPLETE</p>
                  </div>
                  <p className="text-primary text-xl font-bold leading-none tracking-tighter">100%</p>
                </div>
                <div className="relative h-3 w-full rounded-full bg-white/5 overflow-hidden border border-white/10">
                  <div className="absolute inset-y-0 left-0 bg-primary rounded-full shadow-[0_0_15px_rgba(174,62,254,0.4)]" style={{ width: '100%' }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-white/30 uppercase tracking-tighter">
                  <span>5.4 PB processed</span>
                  <span>checksum: 0x88F2A...OK</span>
                </div>
              </div>

              {/* Message Display Area */}
              {showMessage && (
                <div className="mx-2 p-5 rounded-xl border border-primary/30 bg-black/80 backdrop-blur-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                  <p className="text-[10px] font-mono text-primary/60 uppercase tracking-[0.3em] mb-3">DECRYPTED MESSAGE</p>
                  <p className="text-white text-base font-light leading-relaxed tracking-wide font-mono">
                    {displayedText}
                    {!typingComplete && (
                      <span className="inline-block w-[2px] h-[1.1em] bg-primary ml-0.5 align-text-bottom animate-[blink_1s_infinite]"></span>
                    )}
                  </p>
                  {!typingComplete && (
                    <button
                      onClick={skipTyping}
                      className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/50 font-mono tracking-widest transition-colors"
                    >
                      SKIP &gt;&gt;
                    </button>
                  )}
                </div>
              )}

              {/* Button Area */}
              {!showMessage && (
                <div className="flex flex-col items-center pt-4">
                  <button
                    onClick={startTyping}
                    disabled={isCompleted}
                    className={`group relative flex w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-lg h-16 text-white text-lg font-bold leading-normal tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 ${isCompleted
                        ? 'bg-green-600/80 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                        : 'bg-primary shadow-[0_0_15px_rgba(174,62,254,0.4)]'
                      }`}
                  >
                    <span className="relative z-10">{isCompleted ? 'MESSAGE DECODED' : 'VIEW FINAL MESSAGE'}</span>
                  </button>
                  <div className="mt-4 flex items-center gap-2 text-primary/40 text-[10px] uppercase font-mono tracking-widest">
                    <span className="animate-pulse">{'\u25CF'}</span> ENCRYPTED LINK SECURE
                  </div>
                </div>
              )}
            </main>

            <footer className="mt-8 relative z-10 p-6 bg-white/5 border-t border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-solar-gold text-lg">restaurant</span>
                    <p className="text-white/60 text-[11px] font-bold tracking-[0.15em] uppercase">Final Mission Objective</p>
                  </div>
                  <p className="text-solar-gold text-xl font-bold leading-tight tracking-wide drop-shadow-[0_2px_4px_rgba(255,215,0,0.3)]">NICOLA'S RESERVATION</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-white/40 text-sm">schedule</span>
                    <p className="text-white/80 text-sm font-medium tracking-widest">9:45 PM TONIGHT</p>
                  </div>
                </div>
                <div className="relative w-24 h-24 bg-center bg-cover rounded-lg border border-white/20 shadow-xl" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBmoVz6eUQtE6NGkcMYL92Y8fS8TNxkKlIjhozONg6rhjJPBHtIyfzKaT7A-vB0HcNqX_Krc9SHM5wIft83dVDLXM7_-52zbKpmm3WQlnxJJwz9ECiuTYxa0vyWv-41UaGKca5bInw8w-se8r7FOtQfDKCdO1kVuY2LXYyNFcO-swYLZ3xa9dClP6KwaQzLmB9a1lc47bVK896DhWElsZZVp0DNVhxdhnf0YHOp12pATVxLlDwf6ggkByox_DaxdJocVeihFwERgqgY')" }}></div>
              </div>
              <div className="mt-8 opacity-20 font-mono text-[8px] flex justify-between uppercase tracking-widest">
                <span>// Protocol_Omega.sh</span>
                <span>session_id: 817-AX-009</span>
              </div>
            </footer>

            <style>{`
              @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
              }
              @keyframes confettiFall {
                0% {
                  transform: translateY(0) rotate(0deg);
                  opacity: 1;
                }
                100% {
                  transform: translateY(100vh) rotate(720deg);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        );
      }}
    </StageWrapper>
  );
};

export default Stage15Omega;
