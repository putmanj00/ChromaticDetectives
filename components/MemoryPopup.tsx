import React, { useState } from 'react';

interface MemoryPopupProps {
  year: number;
  photoFile: string;
  objectPosition?: string;
  objectFit?: 'cover' | 'contain';
  onDismiss: () => void;
}

const MemoryPopup: React.FC<MemoryPopupProps> = ({ year, photoFile, objectPosition, objectFit = 'cover', onDismiss }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full animate-in fade-in zoom-in duration-500">
        {/* Year photo */}
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-primary/40 shadow-[0_0_40px_rgba(174,62,254,0.3)]">
          {imgError ? (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <span className="text-white text-6xl font-black">{year}</span>
            </div>
          ) : (
            <img
              src={photoFile}
              alt={`Memory from ${year}`}
              className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`}
              style={objectPosition ? { objectPosition } : undefined}
              loading="eager"
              onError={() => setImgError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-3xl font-black tracking-tight drop-shadow-lg">{year}</p>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <p className="text-[10px] font-mono text-acid uppercase tracking-[0.3em] animate-pulse">
            Memory Recovered
          </p>
          <h2 className="text-white text-2xl font-bold tracking-tight">
            {year}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">diamond</span>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              Crystal Obtained
            </p>
            <span className="material-symbols-outlined text-primary text-xl">diamond</span>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onDismiss}
          className="w-full max-w-xs py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg text-sm tracking-wider hover:shadow-[0_0_20px_rgba(174,62,254,0.5)] transition-shadow active:scale-95"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default MemoryPopup;
