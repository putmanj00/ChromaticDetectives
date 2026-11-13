import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  isActive: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  isActive,
  onClose,
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  useEffect(() => {
    if (!isActive) {
      // Inline stream cleanup to avoid setState-in-effect lint warning
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      setIsReady(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setIsReady(true);
        }
      } catch {
        if (!cancelled) setHasCamera(false);
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isActive, stopStream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    onCapture(base64);
  }, [isReady, onCapture]);

  if (!isActive) return null;

  // Fallback: file input for devices without getUserMedia
  if (!hasCamera) {
    return (
      <div className="relative w-full aspect-[3/4] bg-black/80 rounded-xl border border-primary/30 flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-4xl text-primary/60">
          photo_camera
        </span>
        <p className="text-xs font-mono text-white/60 text-center px-4">
          Camera unavailable. Use file upload instead.
        </p>
        <label className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm cursor-pointer shadow-[0_0_20px_rgba(174,62,254,0.5)]">
          TAKE PHOTO
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                onCapture(result.split(',')[1]);
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-black/60 border border-white/20 text-white"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[3/4] bg-black rounded-xl border border-primary/30 overflow-hidden">
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(174,62,254,0.1) 2px, rgba(174,62,254,0.1) 4px)',
        }}
      />

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Custom overlay content (brackets, reticle, etc.) */}
      {children && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {children}
        </div>
      )}

      {/* Capture button */}
      <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center">
        <button
          onClick={capture}
          disabled={!isReady}
          className="h-16 w-16 rounded-full border-4 border-white/80 bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
        >
          <div className="h-12 w-12 rounded-full bg-white/90" />
        </button>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 h-8 w-8 flex items-center justify-center rounded-full bg-black/60 border border-white/20 text-white"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}

      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl text-primary animate-pulse">
              videocam
            </span>
            <p className="text-xs font-mono text-white/60 mt-2">
              INITIALIZING CAMERA...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
