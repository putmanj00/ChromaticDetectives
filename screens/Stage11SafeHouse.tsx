import React, { useState, useEffect } from 'react';
import StageWrapper from '../components/StageWrapper';

const Stage11SafeHouse: React.FC = () => {
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(false);
        setEnteredCode('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleNumberPress = (n: number) => {
    if (error) return;
    if (enteredCode.length < 5) {
      setEnteredCode(prev => prev + String(n));
    }
  };

  const handleClear = () => {
    if (error) return;
    setEnteredCode('');
  };

  const handleBackspace = () => {
    if (error) return;
    setEnteredCode(prev => prev.slice(0, -1));
  };

  const getDigitDisplay = (index: number): { char: string; active: boolean } => {
    if (index < enteredCode.length) {
      return { char: enteredCode[index], active: true };
    }
    return { char: '\u2022', active: false };
  };

  return (
    <StageWrapper stageId={11}>
      {({ onComplete, isCompleted }) => {
        const handleSubmit = () => {
          if (isCompleted) return;
          if (enteredCode === '48214') {
            onComplete();
          } else {
            setError(true);
          }
        };

        return (
          <div className="flex flex-col items-center max-w-lg mx-auto w-full">
            <div className={`relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-8 group ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10"></div>
              <div className="w-full h-full bg-center bg-no-repeat bg-cover transform scale-105 transition-transform duration-[10s]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDyxAurw5xWsI_hUKFwB3eG6CGWCMezHnUIb7WT-dmJKhQAZoKd8m7o7v63njbulNW5QwWlkRdYygb8MK171s8UJUjNSk_K_55pgQ4vk6iT8YXfr16sORHQWaJCPoABODtc3eN1vuJZ4BKtCEG6lVi4oVMsXG_-Ctp6pPlSUUmn5QnKV2dTui_n1qqtUEoL0rhbCTKtEJNOZdZDeWevav0YFmz4OBK-O4IFfmYxbG1RwcOv2IwpHzSRFl8i_iAOEn5wAuy8jtd4k5bQ')" }}></div>
              <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center">
                <div className="flex gap-3 px-4">
                  {[0, 1, 2, 3, 4].map(i => {
                    const { char, active } = getDigitDisplay(i);
                    return (
                      <div
                        key={i}
                        className={`w-10 h-14 border-b-2 text-2xl flex items-center justify-center font-bold ${
                          error
                            ? 'border-red-500 text-red-500'
                            : active
                              ? 'border-primary text-primary'
                              : 'border-white/20 text-white/30'
                        }`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-center mb-8 px-6">
              <p className="text-xs text-primary font-bold tracking-widest uppercase mb-2">Decryption Required</p>
              <h1 className="text-sm font-light leading-relaxed tracking-wider text-white/80">ENTER THE CODE FOUND ON THE BOTTLE TO REVEAL THE NEXT SAFE HOUSE</h1>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-[300px] mb-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button
                  key={n}
                  onClick={() => handleNumberPress(n)}
                  disabled={isCompleted}
                  className="aspect-square rounded-full flex items-center justify-center text-xl hover:bg-primary/20 transition-colors bg-white/5 border border-white/10 active:scale-95"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={handleClear}
                disabled={isCompleted}
                className="aspect-square rounded-full flex items-center justify-center text-xs text-white/40 uppercase tracking-tighter hover:bg-white/10 transition-colors active:scale-95"
              >
                Clear
              </button>
              <button
                onClick={() => handleNumberPress(0)}
                disabled={isCompleted}
                className="aspect-square rounded-full flex items-center justify-center text-xl hover:bg-primary/20 transition-colors bg-white/5 border border-white/10 active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                disabled={isCompleted}
                className="aspect-square rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined">backspace</span>
              </button>
            </div>

            <div className="w-full px-4 mb-12">
              <button
                onClick={handleSubmit}
                disabled={isCompleted || enteredCode.length === 0}
                className={`w-full py-5 rounded-lg border-2 font-bold tracking-[0.2em] uppercase transition-all shadow-[0_0_5px_#ae3efe] ${
                  isCompleted
                    ? 'border-green-500 text-green-500 bg-green-500/10'
                    : error
                      ? 'border-red-500 text-red-500'
                      : 'border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isCompleted ? 'Coordinates Unlocked' : 'Submit Coordinates'}
              </button>
            </div>

            <footer className="w-full p-6 border-t border-white/5 bg-black/50 backdrop-blur-md">
              <div className="flex justify-between items-center max-w-lg mx-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Current Location</span>
                  <span className="text-xs text-white/60 font-medium">Classified - Sector 7</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Time Remaining</span>
                  <span className="text-xs text-primary font-bold">14:52:08</span>
                </div>
              </div>
            </footer>

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

export default Stage11SafeHouse;
