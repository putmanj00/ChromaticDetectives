import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Modality } from "@google/genai";
import StageWrapper from '../components/StageWrapper';
import { useGame } from '../lib/GameContext';

// Sub-component to handle content and logic within StageWrapper's scope
const Stage01Content: React.FC<{ onComplete: () => void; isCompleted: boolean; cluePanelNode: React.ReactNode }> = ({ onComplete, isCompleted, cluePanelNode }) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [hexInput, setHexInput] = useState('');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlayingRef = useRef(false);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { isStageUnlocked, completeStage, collectItem } = useGame();

  /* eslint-enable @typescript-eslint/no-unused-vars */

  const isUnlocked = isCompleted || hexInput.trim().toUpperCase() === '0XAC3CFE';

  const handleVideoComplete = () => { // Modified signature to match onEnded
    collectItem('Obsidian');
    onComplete();
  };

  // Initialize Audio Context on mount (suspended)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    setTimeout(() => setAudioContext(ctx), 0);
    return () => {
      ctx.close();
    };
  }, []);

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

  const playStoryline = async () => {
    if (!audioContext || isPlayingRef.current || isCompleted || !isUnlocked) return;

    // Resume audio context if suspended (browser policy)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    setIsPlaying(true);
    isPlayingRef.current = true;

    try {
      // Check for API Key selection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await aistudio.openSelectKey();
          setIsPlaying(false);
          return;
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Prisma City is suffering from a metaphysical blight known as "The Fade." Colors are draining from the world, leaving behind a dull, greyscale reality. This is not a natural phenomenon but a heist. The "Prism Gaze," a primordial artifact capable of refracting pure white light into the infinite spectrum of life, has been stolen. Two Spectral Investigators have been hired by the Chromatic Council. Their mission: Track the thief, recover the Prism Gaze, and restore saturation to the city before The Fade becomes permanent.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
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
        const outputNode = audioContext.createGain();
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          audioContext,
          24000,
          1,
        );
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNode);
        source.connect(audioContext.destination);
        source.start();

        source.onended = () => {
          setIsPlaying(false);
          setShowVideo(true);
        };
      } else {
        setIsPlaying(false);
        // Fallback if no audio generated
        setShowVideo(true);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
      // Fallback on error
      setShowVideo(true);
    }
  };

  // Auto-play video when shown
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video autoplay failed:", e));
    }
  }, [showVideo]);

  return (
    <div className="bg-[#030303] font-display text-white min-h-screen relative overflow-x-hidden border-x border-acid/10 max-w-md mx-auto">
      <div className="fixed inset-0 scanline opacity-30 z-50 pointer-events-none"></div>

      {/* TopAppBar */}
      <div className="flex items-center bg-[#030303] p-6 pb-2 justify-between">
        <button onClick={() => navigate('/')} className="text-acid flex size-10 shrink-0 items-center">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>
        <h2 className="text-acid text-sm font-bold leading-tight tracking-[0.2em] flex-1 ml-4 uppercase" style={{ textShadow: "0 0 5px rgba(255, 253, 66, 0.5)" }}>Stage_01: Origin</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 text-acid">
            <span className="material-symbols-outlined">settings_input_component</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="relative rounded-lg overflow-hidden aspect-[9/16] bg-neutral-900 group border border-acid/50 shadow-[0_0_15px_rgba(255,253,66,0.2)]">

          {/* Static Image / Placeholder */}
          {!showVideo && !isCompleted && (
            <>
              <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCi0Z_K_hmrxAaZe9PNh_z4Qg3gl9YJyG9FlZXeCuXg399zDmWw-faB_mtr2uAISixbUGvkk2QHCEQOT9SJczt671UMY07un8yAg0mvDPJ9HubogZtmFMsBWA5reKk9iAm9k0E_5QS3Jk2GZgvRo5vKTv3rgri3aODMd4Mkp0EazVxjuinCYeEJB3765OSTcLr0-eI5fDWRJDTJqauHfBk-ZaCyobryWhubpgCMWlFiSVUUewH2Z9C1p26sWLv37DIF3wxqtEZdVdAr')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent"></div>
            </>
          )}

          {/* Video Player */}
          {showVideo && (
            <video
              ref={videoRef}
              src="/Video_Updated_To_Resemble_Couple.mp4"
              className="w-full h-full object-cover"
              playsInline
              onEnded={handleVideoComplete}
            />
          )}

          {/* Video Player (Completed State) */}
          {isCompleted && !showVideo && (
            <video
              src="/Video_Updated_To_Resemble_Couple.mp4"
              className="w-full h-full object-cover opacity-50 grayscale"
              playsInline
              muted
              loop
              autoPlay
            />
          )}

          {/* Loading / Playing State Overlay */}
          {isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 backdrop-blur-[2px]">
              <div className="flex space-x-1">
                <div className="w-1 h-8 bg-acid animate-wave"></div>
                <div className="w-1 h-8 bg-acid animate-wave" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-8 bg-acid animate-wave" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-8 bg-acid animate-wave" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1 h-8 bg-acid animate-wave" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-acid font-mono text-xs tracking-widest mt-4 animate-pulse">DECRYPTING AUDIO STREAM...</p>
            </div>
          )}

          {/* Unmute Button for Video */}
          {showVideo && (
            <div className="absolute top-4 right-4 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                  }
                }}
                className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md border border-white/20 hover:bg-black/70"
              >
                <span className="material-symbols-outlined">volume_up</span>
              </button>
            </div>
          )}

          {/* Play Button */}
          {!isPlaying && !showVideo && !isCompleted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <button
                onClick={playStoryline}
                disabled={!isUnlocked}
                className={`flex shrink-0 items-center justify-center rounded-full size-20 border backdrop-blur-sm transition-all duration-500 ${isUnlocked ? 'bg-primary/20 border-primary text-primary active:scale-95 shadow-[0_0_20px_rgba(174,62,254,0.4)] cursor-pointer' : 'bg-neutral-800/50 border-neutral-700 text-neutral-600 grayscale cursor-not-allowed'}`}
              >
                <span className="material-symbols-outlined text-4xl fill-1">{isUnlocked ? 'play_arrow' : 'lock'}</span>
              </button>
              <p className={`mt-4 text-[10px] tracking-[0.3em] uppercase transition-colors duration-500 ${isUnlocked ? 'text-acid opacity-70' : 'text-neutral-600'}`}>
                {isUnlocked ? 'Feed_Encrypted' : 'Authenticating...'}
              </p>
            </div>
          )}

          {/* Completed Overlay */}
          {isCompleted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-none">
              <span className="material-symbols-outlined text-primary text-5xl mb-2">check_circle</span>
              <p className="text-primary font-mono text-sm tracking-widest">PROTOCOL COMPLETE</p>
            </div>
          )}

          {/* Corner Decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-acid"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-acid"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-acid"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-acid"></div>
        </div>

        {/* Intel Card */}
        <div className="mt-4 bg-black/40 border border-acid/20 rounded-lg p-3">
          <p className="text-[10px] font-mono text-acid uppercase tracking-widest mb-1">Intel</p>
          <p className="text-xs text-white/70 leading-relaxed">
            The mystery begins with a <span className="text-acid font-bold">breach in the Magic Circle</span>. Enter the hex code to authenticate, then listen to the <span className="text-primary font-bold">decrypted origin signal</span> to begin your investigation.
          </p>
        </div>

        {/* Log */}
        <div className="mt-6 space-y-1">
          <p className="text-acid text-xs font-medium leading-relaxed">&gt; DECRYPTING_ORIGIN... <span className={isCompleted || isUnlocked ? "opacity-50" : "animate-pulse"}>{isCompleted ? "COMPLETED" : "WAITING"}</span></p>
          <p className="text-acid text-xs font-medium leading-relaxed">&gt; ESTABLISHING_NEURAL_LINK... <span className={isPlaying ? "animate-pulse text-primary" : "opacity-50"}>{isPlaying ? "TX_ACTIVE" : isUnlocked ? "READY" : "LOCKED"}</span></p>
          <p className="text-acid text-xs font-medium leading-relaxed opacity-60">&gt; [0xAC3CFE] AUTHENTICATION_{isCompleted ? 'COMPLETE' : isUnlocked ? 'VERIFIED' : 'PENDING'}_</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(window as any).aistudio && <p className="text-xs text-primary underline cursor-pointer mt-2" onClick={() => (window as any).aistudio.openSelectKey()}>Manage Access Key (Billing)</p>}
          {cluePanelNode}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 px-6 py-4">
        <div className="flex flex-1 flex-col gap-1 rounded-lg p-4 bg-acid/5 border border-acid/10 relative overflow-hidden">
          <p className="text-acid/60 text-[10px] font-bold tracking-widest uppercase">Hex_Core</p>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            placeholder="ENTER_CODE"
            className="bg-transparent text-acid tracking-tight text-xl font-bold w-full focus:outline-none placeholder:text-acid/20 uppercase"
            maxLength={8}
            disabled={isCompleted}
          />
          {!isUnlocked && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
        </div>
        <div className={`flex flex-1 flex-col gap-1 rounded-lg p-4 border transition-colors duration-500 ${isUnlocked ? 'bg-primary/5 border-primary/20' : 'bg-neutral-900 border-neutral-800'}`}>
          <p className={`${isUnlocked ? 'text-primary/60' : 'text-neutral-500'} text-[10px] font-bold tracking-widest uppercase`}>Protocol</p>
          <p className={`${isUnlocked ? 'text-primary shadow-primary/20' : 'text-neutral-500'} tracking-tight text-xl font-bold transition-all duration-500`}>
            {isCompleted ? 'COMPLETE' : isUnlocked ? 'ACTIVE' : 'INACTIVE'}
          </p>
        </div>
      </div>

      <div className="p-6 text-center">
        <p className="text-acid/30 text-[9px] tracking-[0.4em] uppercase">Unauthorized access is strictly prohibited</p>
      </div>
    </div>
  );
};

const Stage01Origin: React.FC = () => {
  return (
    <StageWrapper stageId={1} customLayout inlineClue>
      {({ onComplete, isCompleted, cluePanelNode }) => (
        <Stage01Content onComplete={onComplete} isCompleted={isCompleted} cluePanelNode={cluePanelNode} />
      )}
    </StageWrapper>
  );
};

export default Stage01Origin;
