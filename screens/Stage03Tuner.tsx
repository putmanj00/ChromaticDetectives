import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Modality } from "@google/genai";
import { useGame } from '../lib/GameContext';
import StageWrapper from '../components/StageWrapper';

const TARGET_FREQUENCY = 14.02;
const LOCK_THRESHOLD = 0.02;

const rotationToFreq = (rot: number) => 13.50 + (rot - 145) * 0.005;

const Stage03Tuner: React.FC = () => {
  const navigate = useNavigate();
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { isStageUnlocked, completeStage, collectItem } = useGame();
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [rotation, setRotation] = useState(145);
  const frequency = rotationToFreq(rotation);
  const [isPlaying, setIsPlaying] = useState(false);
  const [broadcastStarted, setBroadcastStarted] = useState(false);
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const staticSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const staticGainRef = useRef<GainNode | null>(null);
  const voiceSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const voiceGainRef = useRef<GainNode | null>(null);
  const lastBroadcastTime = useRef<number>(0);

  const [signalLocked, setSignalLocked] = useState(false);
  const completedRef = useRef(false);
  const isNearTarget = Math.abs(frequency - TARGET_FREQUENCY) <= LOCK_THRESHOLD;

  const handleLockSignal = useCallback(() => {
    if (signalLocked || !isNearTarget) return;
    setSignalLocked(true);
    collectItem('Rose Quartz');
  }, [signalLocked, isNearTarget, collectItem]);

  // Auto-lock immediately when near target (only after broadcast started)
  useEffect(() => {
    if (isNearTarget && !signalLocked && broadcastStarted) {
      handleLockSignal();
    }
  }, [isNearTarget, signalLocked, broadcastStarted, handleLockSignal]);

  // Stop static immediately and boost voice when signal is locked
  useEffect(() => {
    if (signalLocked && audioContextRef.current) {
      // Kill static instantly
      if (staticGainRef.current) {
        staticGainRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      }
      try { staticSourceRef.current?.stop(); } catch { /* ignore */ }
      staticSourceRef.current = null;
      // Boost voice to full
      if (voiceGainRef.current) {
        voiceGainRef.current.gain.setValueAtTime(1.0, audioContextRef.current.currentTime);
      }
    }
  }, [signalLocked]);

  // Initialize Audio Context on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = ctx;
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const handleRotate = (direction: 'left' | 'right') => {
    if (signalLocked || !broadcastStarted) return;
    setRotation(prev => direction === 'left' ? prev - 1 : prev + 1);
  };

  // Drag-to-rotate dial support
  // During drag, we bypass React state entirely and update the DOM directly
  // via refs + requestAnimationFrame. State is committed only on drag end.
  const knobRef = useRef<HTMLDivElement>(null);
  const freqDisplayRef = useRef<HTMLSpanElement>(null);
  const isDragging = useRef(false);
  const lastAngle = useRef(0);
  const rotationRef = useRef(145);
  const rafRef = useRef(0);

  // Keep rotationRef in sync when state changes (e.g. button clicks)
  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (signalLocked || !broadcastStarted) return;
    isDragging.current = true;
    lastAngle.current = getAngleFromEvent(clientX, clientY);
  }, [getAngleFromEvent, signalLocked, broadcastStarted]);

  const updateAudioGains = useCallback((freq: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const distance = Math.abs(freq - TARGET_FREQUENCY);
    const normalizedDist = Math.min(distance / 2.0, 1.0);
    const voiceVolume = Math.max(0, 1 - (normalizedDist * 4));
    const staticVolume = Math.min(0.3, normalizedDist * 0.3);
    if (voiceGainRef.current) {
      voiceGainRef.current.gain.setTargetAtTime(voiceVolume, ctx.currentTime, 0.1);
    }
    if (staticGainRef.current) {
      staticGainRef.current.gain.setTargetAtTime(staticVolume, ctx.currentTime, 0.1);
    }
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const angle = getAngleFromEvent(clientX, clientY);
    let delta = angle - lastAngle.current;
    // Handle wrap-around at ±180
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngle.current = angle;
    rotationRef.current += delta;

    // Throttle visual updates to one per animation frame — no React re-renders
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const rot = rotationRef.current;
        if (knobRef.current) {
          knobRef.current.style.transform = `rotate(${rot}deg)`;
        }
        const freq = rotationToFreq(rot);
        if (freqDisplayRef.current) {
          freqDisplayRef.current.textContent = freq.toFixed(2);
        }
        updateAudioGains(freq);
      });
    }
  }, [getAngleFromEvent, updateAudioGains]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    // Commit final rotation to React state (single re-render)
    setRotation(rotationRef.current);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current) e.preventDefault();
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createWhiteNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  // Update gains when frequency changes via React state (button clicks, drag end)
  useEffect(() => {
    updateAudioGains(frequency);
  }, [frequency, updateAudioGains]);

  const stopAudio = () => {
    if (staticSourceRef.current) {
      try { staticSourceRef.current.stop(); } catch { /* ignore */ }
      staticSourceRef.current = null;
    }
    if (voiceSourceRef.current) {
      try { voiceSourceRef.current.stop(); } catch { /* ignore */ }
      voiceSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (staticSourceRef.current) {
        try { staticSourceRef.current.stop(); } catch { /* ignore */ }
        staticSourceRef.current = null;
      }
      if (voiceSourceRef.current) {
        try { voiceSourceRef.current.stop(); } catch { /* ignore */ }
        voiceSourceRef.current = null;
      }
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, []);

  const broadcastSignal = async () => {
    // Rate limit: Debounce API calls (2 seconds)
    if (Date.now() - lastBroadcastTime.current < 2000) {
      console.warn('Broadcast signal debounced');
      return;
    }
    lastBroadcastTime.current = Date.now();

    if (isPlaying) {
      stopAudio();
      return;
    }

    // Enable controls immediately regardless of audio success
    setIsPlaying(true);
    setBroadcastStarted(true);

    // Ensure AudioContext is ready
    try {
      if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = ctx;
      }
    } catch (e) {
      console.error('AudioContext creation failed:', e);
      return;
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const context = ctx;

    // Setup Static Noise
    const staticNode = context.createBufferSource();
    staticNode.buffer = createWhiteNoiseBuffer(context);
    staticNode.loop = true;
    const staticGain = context.createGain();
    staticGain.gain.value = 0.5; // Initial value, updated by effect
    staticNode.connect(staticGain);
    staticGain.connect(context.destination);
    staticSourceRef.current = staticNode;
    staticGainRef.current = staticGain;
    staticNode.start();

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_KEY || process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: "Say in a mysterious, cryptic tone: Can you hear the hum? That's the sound of history being overwritten. I wonder if you'll scream when I delete you.",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const voiceGain = ctx.createGain();
        voiceGain.gain.value = 0.0; // Initial value, updated by effect

        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          ctx,
          24000,
          1,
        );
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(voiceGain);
        voiceGain.connect(ctx.destination);

        voiceSourceRef.current = source;
        voiceGainRef.current = voiceGain;

        // Play voice message once (not looped)
        source.loop = false;
        source.start();

        // Use live rotation value (not stale closure) to set correct initial volume.
        // If signal already locked while waiting for Gemini, go straight to full voice.
        const currentFreq = rotationToFreq(rotationRef.current);
        const alreadyLocked = Math.abs(currentFreq - TARGET_FREQUENCY) <= LOCK_THRESHOLD;

        if (alreadyLocked) {
          voiceGain.gain.setValueAtTime(1.0, ctx.currentTime);
          staticGain.gain.setValueAtTime(0, ctx.currentTime);
        } else {
          const distance = Math.abs(currentFreq - TARGET_FREQUENCY);
          const normalizedDist = Math.min(distance / 2.0, 1.0);
          const voiceVol = Math.max(0, 1 - (normalizedDist * 4));
          const staticVol = Math.min(0.3, normalizedDist * 0.3);
          voiceGain.gain.setValueAtTime(voiceVol, ctx.currentTime);
          staticGain.gain.setValueAtTime(staticVol, ctx.currentTime);
        }


      } else {
        console.warn("No audio data, continuing with static.");
        // stopAudio(); // Remove stop call
      }
    } catch (e: unknown) {
      console.error("Audio generation failed, continuing with static only:", e);
      // Do NOT stop audio, allow static to continue
    }
  };

  // Auto-start audio when signal locks (if not already playing)
  useEffect(() => {
    if (signalLocked && !isPlaying) {
      broadcastSignal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signalLocked]);

  return (
    <StageWrapper stageId={3} customLayout inlineClue>
      {({ onComplete, isCompleted, cluePanelNode }) => {
        // Auto-complete stage after signal locks (2s delay for audio)
        if (signalLocked && !isCompleted && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onComplete(), 2000);
        }

        return (
          <div className="bg-background-dark text-white font-display min-h-screen flex flex-col relative selection:bg-secondary selection:text-white">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-grit-pattern opacity-40 pointer-events-none z-0"></div>
            <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(0,0,0,0.2))", backgroundSize: "100% 4px" }}></div>

            {/* Header */}
            <header className="relative z-20 flex items-center justify-between p-4 bg-background-dark/80 backdrop-blur-md border-b border-white/10">
              <button onClick={() => navigate('/')} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors text-white">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="flex flex-col items-center">
                <h1 className="text-xs font-bold tracking-[0.2em] text-acid/80">PROTOCOL: {isCompleted ? 'DECODED' : signalLocked ? 'LOCKED' : 'ACTIVE'}</h1>
                <h2 className="text-sm font-bold tracking-widest text-white mt-0.5">STAGE 03</h2>
              </div>
              <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors text-white relative group">
                <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                <span className="material-symbols-outlined">settings</span>
              </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 gap-6 pb-24">
              {/* Intel Card */}
              <div className="w-full bg-black/40 border border-secondary/20 rounded-lg p-3">
                <p className="text-[10px] font-mono text-secondary uppercase tracking-widest mb-1">Intel</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  The air near the clock tower is thick with <span className="text-secondary font-bold">alchemical interference</span>. Tune the dial in order to tune to the correct <span className="text-acid font-bold">frequency</span> in order to decode the hidden broadcast and recover the crystal shard.
                </p>
              </div>

              {/* Frequency Readout */}
              <div className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-primary' : signalLocked ? 'bg-acid' : isPlaying ? 'bg-acid' : 'bg-red-500'} animate-pulse`}></span>
                  <span className="text-[10px] tracking-[0.2em] text-white/60 font-mono">
                    {isCompleted ? 'DECODED' : signalLocked ? 'SIGNAL LOCKED' : 'LIVE SIGNAL'}
                  </span>
                </div>
                <div className="relative w-full bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-white/40 tracking-widest font-mono">FREQ_MOD</span>
                    <span className={`text-xs tracking-widest font-mono animate-pulse ${signalLocked || isCompleted ? 'text-acid' : 'text-secondary'}`}>
                      {isCompleted ? 'DECODED' : signalLocked ? 'LOCKED' : 'UNLOCKED'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 my-2">
                    <span ref={freqDisplayRef} className={`text-6xl font-bold tracking-tighter font-mono tabular-nums ${signalLocked || isCompleted ? 'text-acid' : 'text-white'}`} style={{ textShadow: signalLocked || isCompleted ? "0 0 15px rgba(255, 253, 66, 0.7)" : "0 0 10px rgba(174, 62, 254, 0.7)" }}>{frequency.toFixed(2)}</span>
                    <span className="text-xl font-medium text-white/50 mb-1">MHz</span>
                  </div>
                  {signalLocked && !isCompleted && (
                    <p className="text-center text-acid font-mono text-xs tracking-widest mt-2 animate-pulse font-bold" style={{ textShadow: "0 0 10px rgba(255, 253, 66, 0.5)" }}>
                      SIGNAL LOCKED
                    </p>
                  )}
                  <div className="flex gap-1 h-1 w-full mt-4">
                    <div className="flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div className={`h-full ${signalLocked || isCompleted ? 'bg-acid' : 'bg-primary'} transition-all duration-300`} style={{ width: signalLocked || isCompleted ? '100%' : '75%' }}></div>
                    </div>
                    <div className={`w-1/4 rounded-full ${signalLocked || isCompleted ? 'bg-acid/30' : 'bg-white/10'}`}></div>
                  </div>
                </div>
              </div>

              {/* Signal Visualization */}
              <div
                data-testid="broadcast-trigger"
                className="w-full h-24 relative overflow-hidden rounded-lg bg-black/20 border-x border-acid/20"
                onClick={broadcastSignal}
              >
                <div className={`absolute inset-0 flex items-center justify-center gap-2 z-20 ${isPlaying ? 'opacity-0' : 'opacity-100'} transition-opacity cursor-pointer hover:bg-white/5`}>
                  <span className="material-symbols-outlined text-acid text-3xl animate-pulse">play_circle</span>
                  {!broadcastStarted && <span className="text-acid font-mono text-xs tracking-widest font-bold">BROADCAST</span>}
                </div>
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                  <path d="M0 50 Q 20 50, 40 50 T 80 50 T 120 40 T 160 80 T 200 20 T 240 80 T 280 40 T 320 50 T 360 50 T 400 50" fill="none" stroke={isPlaying ? "#00ffff" : "#ccff00"} strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 5px rgba(204, 255, 0, 0.5))" }}>
                    {isPlaying && (
                      <animate attributeName="d" dur="0.5s" repeatCount="indefinite" values="M0 50 Q 20 50, 40 50 T 80 50 T 120 40 T 160 80 T 200 20 T 240 80 T 280 40 T 320 50 T 360 50 T 400 50; M0 50 Q 20 40, 40 60 T 80 50 T 120 70 T 160 30 T 200 80 T 240 20 T 280 60 T 320 40 T 360 50 T 400 50; M0 50 Q 20 50, 40 50 T 80 50 T 120 40 T 160 80 T 200 20 T 240 80 T 280 40 T 320 50 T 360 50 T 400 50" />
                    )}
                  </path>
                </svg>
                <div className="absolute bottom-1 right-2 text-[10px] text-acid font-mono opacity-80">AUDIO_IN_03</div>
              </div>

              {/* Dial */}
              <div className="relative flex-1 w-full flex items-center justify-center py-4 min-h-[300px]">
                <div className="relative w-64 h-64 rounded-full bg-surface-dark border-4 border-white/5 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_0_30px_rgba(174,62,254,0.1)]">
                  <div className="absolute inset-0 rounded-full border border-white/5">
                    <div className="absolute inset-0 rounded-full" style={{ background: "repeating-conic-gradient(from 0deg, transparent 0deg 4deg, rgba(255,255,255,0.1) 4deg 5deg)" }}></div>
                  </div>
                  {/* Knob */}
                  <div ref={knobRef}
                    className={`w-48 h-48 rounded-full bg-[#1a1a1a] border border-white/10 relative transition-none select-none touch-none ${signalLocked || isCompleted ? 'opacity-60 cursor-not-allowed' : !broadcastStarted ? 'opacity-60 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
                    style={{ transform: `rotate(${rotation}deg)`, willChange: 'transform' }}
                    onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                    onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}>
                    <div className="absolute inset-0 rounded-full bg-grit-pattern opacity-50"></div>
                    {/* Needle */}
                    <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-1 h-20 ${signalLocked || isCompleted ? 'bg-acid shadow-[0_0_15px_2px_rgba(255,253,66,0.8)]' : 'bg-secondary shadow-[0_0_15px_2px_rgba(255,0,153,0.8)]'} rounded-full origin-bottom`}></div>
                    {/* Center Cap */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-surface-dark border border-white/10 shadow-inner flex items-center justify-center" onClick={broadcastSignal}>
                      <div className={`w-2 h-2 ${isPlaying ? 'bg-acid' : signalLocked || isCompleted ? 'bg-acid' : 'bg-primary'} rounded-full animate-pulse shadow-[0_0_10px_rgba(174,62,254,1)]`}></div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                    <span className="material-symbols-outlined text-acid text-sm animate-bounce">arrow_drop_down</span>
                  </div>
                </div>

                {/* Manual Controls for Accessibility/Precision — always visible */}
                {!isCompleted && (
                  <div className="absolute bottom-0 w-full flex justify-between px-8 pointer-events-none">
                    <button onClick={() => handleRotate('left')} disabled={!broadcastStarted || signalLocked} className={`pointer-events-auto size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-95 ${!broadcastStarted || signalLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/20 hover:border-primary/50'}`}>
                      <span className="material-symbols-outlined text-white">remove</span>
                    </button>
                    <button onClick={() => handleRotate('right')} disabled={!broadcastStarted || signalLocked} className={`pointer-events-auto size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-95 ${!broadcastStarted || signalLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/20 hover:border-primary/50'}`}>
                      <span className="material-symbols-outlined text-white">add</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center z-20 pb-24">
                {isCompleted ? (
                  <>
                    <h3 className="text-primary font-bold tracking-widest text-sm mb-1 uppercase">Signal Decoded</h3>
                    <p className="text-white text-lg font-bold leading-tight max-w-[280px] mx-auto mb-4">
                      FREQUENCY <span className="text-acid bg-acid/10 px-1 rounded">14.02</span> MHz CONFIRMED
                    </p>
                    {cluePanelNode}
                  </>
                ) : signalLocked ? (
                  <>
                    <h3 className="text-acid font-bold tracking-widest text-sm mb-1 uppercase">Signal Locked</h3>
                    <p className="text-white text-lg font-bold leading-tight max-w-[280px] mx-auto">
                      <span className="text-acid bg-acid/10 px-1 rounded">14.02</span> MHz CONFIRMED
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-acid font-bold tracking-widest text-sm mb-1 uppercase">{broadcastStarted ? 'Scanning...' : 'Signal Lost'}</h3>
                    <p className="text-white text-lg font-bold leading-tight max-w-[280px] mx-auto">
                      {broadcastStarted ? 'TUNE THE DIAL TO LOCK THE SIGNAL' : <>PRESS <span className="text-secondary bg-secondary/10 px-1 rounded">BROADCAST</span> TO BEGIN</>}
                    </p>
                  </>
                )}
              </div>
            </main>
          </div>
        );
      }}
    </StageWrapper>
  );
};

export default Stage03Tuner;
