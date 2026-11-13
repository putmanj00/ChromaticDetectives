import React, { useState, useEffect, useRef } from 'react';

interface VideoInterstitialProps {
  src: string;
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  allowSkip?: boolean;
  skipDelayMs?: number;
}

const VideoInterstitial: React.FC<VideoInterstitialProps> = ({
  src,
  onComplete,
  title,
  subtitle,
  allowSkip = true,
  skipDelayMs = 3000,
}) => {
  const [canSkip, setCanSkip] = useState(!allowSkip);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Default to unmuted
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt autoplay
    if (videoRef.current) {
      // Try playing unmuted first
      videoRef.current.muted = false;
      videoRef.current.play().catch((err) => {
        console.log('Autoplay unmuted blocked, showing play button:', err);
        // If unmuted fails, IMMEDIATE show play button to force interaction
        // This ensures later playback will be unmuted
        setShowPlayButton(true);
      });
    }

    if (!allowSkip) return;
    const timer = setTimeout(() => setCanSkip(true), skipDelayMs);
    return () => clearTimeout(timer);
  }, [allowSkip, skipDelayMs]);

  const handleError = () => {
    console.error('VideoInterstitial: video failed to load', src);
    onComplete();
  };

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play();
      setShowPlayButton(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        onEnded={onComplete}
        onError={handleError}
      />

      {/* Title/subtitle overlay */}
      {(title || subtitle) && (
        <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-10">
          {title && (
            <h2 className="text-white text-lg font-bold tracking-widest uppercase drop-shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">{title}</h2>
          )}
          {subtitle && (
            <p className="text-white/60 text-xs font-mono tracking-wider mt-1 drop-shadow-md animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">{subtitle}</p>
          )}
        </div>
      )}

      {/* Controls Container */}
      <div className="absolute bottom-12 left-0 right-0 px-6 flex items-center justify-between z-20 pointer-events-auto">
        {/* Unmute Button */}
        {isMuted && !showPlayButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current) {
                videoRef.current.muted = false;
                setIsMuted(false);
              }
            }}
            className="mr-auto p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            <span className="material-symbols-outlined">volume_off</span>
          </button>
        )}

        {/* Skip button */}
        {canSkip && !showPlayButton && (
          <button
            onClick={onComplete}
            className="ml-auto px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold tracking-widest uppercase hover:bg-white/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            SKIP
          </button>
        )}
      </div>

      {/* Play Button (if autoplay blocked) */}
      {showPlayButton && (
        <button
          onClick={handleManualPlay}
          className="absolute z-30 flex flex-col items-center gap-4 animate-pulse"
        >
          <div className="size-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-[0_0_30px_rgba(174,62,254,0.3)]">
            <span className="material-symbols-outlined text-5xl text-white ml-2">play_arrow</span>
          </div>
          <span className="text-white font-mono text-sm tracking-widest uppercase drop-shadow-md">Tap to Initialize</span>
        </button>
      )}
    </div>
  );
};

export default VideoInterstitial;
