
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StageWrapper from '../components/StageWrapper';
import { useGeminiVision } from '../lib/useGeminiVision';
import { useGame } from '../lib/GameContext';

const Stage05Content: React.FC<{ onComplete: () => void; isCompleted: boolean; cluePanelNode: React.ReactNode }> = ({ onComplete, isCompleted, cluePanelNode }) => {
    const navigate = useNavigate();
    const { collectItem } = useGame();
    const [isARActive, setIsARActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Video Generation State
    // TEMPORARY: Use static video due to API quota limits
    const [introVideoUrl] = useState<string | null>("/Video_Redo_With_Different_Person3.mp4");
    const [isGenerating] = useState(false);
    const [showIntro, setShowIntro] = useState(!isCompleted);
    const [statusMessage] = useState("NEURAL LINK ESTABLISHED...");

    const vision = useGeminiVision({
        referenceImagePath: '/gunInk.jpg',
        matchPrompt: 'Does this photo show an ink bottle shaped like a gun, pistol, or revolver? Look for any decorative ink bottle, pen ink container, or writing ink vessel with a gun or weapon shape.',
    });

    const startAR = async () => {
        setIsARActive(true);
        vision.reset();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setIsARActive(false);
        }
    };

    const stopAR = () => {
        setIsARActive(false);
        vision.reset();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const enterReality = () => {
        setShowIntro(false);
    };

    const captureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
                vision.analyze(base64);
            }
        }
    };

    // Auto-scan interval REMOVED to save API usage
    // Camera now waits for manual capture via button press


    // Auto-complete when match found
    useEffect(() => {
        if (vision.result?.isMatch && !isCompleted) {
            // Short delay to show success state
            const timer = setTimeout(() => {
                onComplete();
                collectItem('Spectral Ink');
                stopAR();
            }, 1500);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vision.result?.isMatch, isCompleted, onComplete]);

    // RENDER: Loading / Vision Sequence
    if (showIntro && !isCompleted) {
        return (
            <div className="bg-black font-display h-screen flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Glitch */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                {isGenerating ? (
                    <div className="flex flex-col items-center gap-6 z-10 px-8 text-center max-w-xs">
                        <div className="size-16 border-4 border-t-primary border-r-secondary border-b-acid border-l-primary rounded-full animate-spin"></div>
                        <div>
                            <h2 className="text-white text-lg font-bold tracking-[0.2em] uppercase animate-pulse">Reconstructing Self</h2>
                            <p className="text-primary font-mono text-xs mt-4 uppercase tracking-widest">{statusMessage}</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full max-w-md mx-auto bg-black flex flex-col animate-in fade-in duration-1000">
                        {/* Video Player */}
                        <div className="relative flex-1 overflow-hidden">
                            {introVideoUrl && (
                                <video
                                    ref={(el) => {
                                        if (el) {
                                            el.muted = false;
                                            el.play().catch(() => {
                                                el.muted = true;
                                                el.play().catch(e => console.error("Background video play failed", e));
                                            });
                                        }
                                    }}
                                    src={introVideoUrl}
                                    loop
                                    playsInline
                                    className="w-full h-full object-contain opacity-80"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>

                            {/* Overlay UI */}
                            <div className="absolute top-8 left-6 right-6 border-l-2 border-acid pl-4">
                                <h1 className="text-2xl font-bold text-white uppercase tracking-tighter leading-none">The Prism Gaze</h1>
                                <p className="text-acid font-mono text-xs tracking-widest mt-1">ARTIFACT DETECTED</p>
                            </div>

                            <div className="absolute bottom-32 left-6 space-y-2">
                                <div className="bg-black/60 backdrop-blur border border-white/10 px-3 py-1.5 rounded inline-block">
                                    <span className="text-[10px] text-white/50 uppercase tracking-widest mr-2">Subject</span>
                                    <span className="text-sm text-white font-bold">"The Editor" is on the run. Locate and retrieve the Prism Gaze from "The Editor"</span>
                                </div>
                            </div>
                        </div>

                        {/* Enter Button */}
                        <div className="absolute bottom-10 left-0 right-0 px-6 flex flex-col gap-4">
                            <button
                                onClick={enterReality}
                                className="w-full h-14 bg-primary text-white font-bold tracking-[0.2em] uppercase rounded-lg shadow-[0_0_20px_rgba(174,62,254,0.5)] hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <span className="material-symbols-outlined">view_in_ar</span>
                                <span>Synchronize Reality</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // RENDER: Main Stage (AR Scanner)
    return (
        <div className="bg-background-dark font-display overflow-hidden h-screen flex flex-col relative w-full">
            <div className="absolute inset-0 z-0">
                <img alt="Dark shop facade" className="w-full h-full object-cover opacity-60 grayscale-[0.3]" src="/stage05_facade.png" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-background-dark/80"></div>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(174, 62, 254, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(174, 62, 254, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
            </div>

            <div className="relative z-20 flex items-center justify-between p-4 bg-background-dark/60 backdrop-blur-md border-b border-primary/30">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')}><span className="material-symbols-outlined text-secondary text-2xl">arrow_back</span></button>
                    <div>
                        <h2 className="text-white text-sm font-bold tracking-widest leading-none">STAGE 05: HIEROPHANY</h2>
                        <p className="text-primary text-[10px] uppercase font-bold tracking-[0.2em]">System Status: {isCompleted ? 'Memory Unlocked' : 'Nominal'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] text-[#ae9abc] uppercase">Network: Secure</span>
                        <span className="text-sm font-bold text-secondary font-mono">0.887 FLUX</span>
                    </div>
                    <button className="flex shrink-0 items-center justify-center rounded-lg h-10 w-10 bg-primary/20 border border-primary/40 text-white"><span className="material-symbols-outlined text-xl">battery_full</span></button>
                </div>
            </div>

            <div className="relative flex-1 z-10 flex items-center justify-center p-6">
                <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-secondary opacity-60"></div>
                <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-secondary opacity-60"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-secondary opacity-60"></div>
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-secondary opacity-60"></div>

                {/* Rotating Card / Camera View */}
                <div className="relative w-64 h-80 border-2 border-cyan-ar shadow-[0_0_20px_rgba(0,242,255,0.4)] flex flex-col items-center justify-center overflow-hidden bg-black" style={{ transform: "perspective(1000px) rotateY(-15deg) skewY(2deg)" }}>
                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-cyan-ar z-20"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-ar z-20"></div>
                    <div className="absolute inset-4 border border-cyan-ar/30 opacity-50 z-20 pointer-events-none"></div>

                    <div className="relative flex items-center justify-center w-full h-full">
                        {isARActive && !isCompleted ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {/* Scanning Overlay */}
                                <div className="absolute inset-0 z-10 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-ar/50 shadow-[0_0_10px_rgba(0,242,255,0.8)] animate-scan-vertical"></div>
                                    {vision.isAnalyzing && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                            <span className="text-cyan-ar font-mono text-xs animate-pulse">ANALYZING...</span>
                                        </div>
                                    )}
                                    {vision.result && !vision.result.isMatch && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm border-2 border-red-500/50 z-20">
                                            <span className="material-symbols-outlined text-red-400 text-3xl mb-1">error_outline</span>
                                            <span className="text-red-400 font-mono text-xs font-bold tracking-widest">NO MATCH</span>
                                            <span className="text-white/50 text-[9px] font-mono mt-1">TRY AGAIN</span>
                                        </div>
                                    )}
                                    {/* Manual Capture Hint */}
                                    {!vision.isAnalyzing && !vision.result && (
                                        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                            <span className="text-white/50 text-[10px] font-mono bg-black/40 px-2 py-1 rounded">TAP CAMERA TO SCAN</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : isCompleted ? (
                            <span className="material-symbols-outlined text-acid text-6xl">check_circle</span>
                        ) : (
                            <>
                                <div className="w-20 h-20 border-2 border-dashed border-primary/60 rounded-full animate-spin-slow"></div>
                                <div className="absolute inset-0 flex items-center justify-center"><span className="material-symbols-outlined text-cyan-ar text-4xl">center_focus_weak</span></div>
                            </>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-24 left-10 space-y-1 font-mono text-[10px] text-secondary">
                    <p>LAT: 39.0837</p>
                    <p>LONG: -84.5109</p>
                    <p>ALT: 12.4m</p>
                    <p className="text-white">SIG STRENGTH: {isCompleted ? 'LOCKED' : 'OPTIMAL'}</p>
                    {isARActive && <p className="text-cyan-ar animate-pulse">CAMERA: ACTIVE</p>}
                </div>
            </div>

            <div className="relative z-20 pb-10 px-6">
                <div className="max-w-md mx-auto flex flex-col gap-4">
                    {/* Intel Card */}
                    <div className="bg-black/80 backdrop-blur-md border-l-4 border-primary p-4 rounded-r-lg shadow-lg">
                        <h3 className="text-primary text-[10px] font-bold tracking-widest uppercase mb-1">Mission Intel</h3>
                        <p className="text-white text-xs leading-relaxed font-mono">
                            Coil and Augur are the Keepers of the Spectral Ink. Verify the specific ink bottle protected by the "Keepers of the Spectrum".
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-acid text-sm">search</span>
                            <span className="text-acid text-[10px] uppercase font-bold tracking-wider">Clue: Guns were harmed in the making of this ink.</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-white text-xl font-bold tracking-tighter leading-tight mb-4 drop-shadow-md">{isCompleted ? 'MEMORY RECOVERED' : 'SCAN TO ANALYZE'}</h3>
                        {!isCompleted && (
                            <div className="flex items-center justify-center gap-6">
                                <button onClick={() => setShowIntro(true)} className="flex shrink-0 items-center justify-center rounded-full size-12 bg-background-dark/80 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"><span className="material-symbols-outlined">movie</span></button>

                                {/* Camera Toggle Button */}
                                <button
                                    onClick={isARActive ? captureImage : startAR}
                                    className={`flex shrink-0 items-center justify-center rounded-full size-20 ${isARActive ? 'bg-red-500/20 border-red-500' : 'bg-primary/20 border-primary'} border-4 text-white shadow-[0_0_30px_rgba(174,62,254,0.4)] hover:scale-105 transition-transform group`}
                                >
                                    <div className={`size-16 rounded-full ${isARActive ? 'bg-red-500' : 'bg-primary'} flex items-center justify-center group-active:scale-90 transition-transform`}>
                                        <span className="material-symbols-outlined text-4xl fill-current">{isARActive ? 'camera' : 'videocam'}</span>
                                    </div>
                                </button>

                                <button onClick={stopAR} className="flex shrink-0 items-center justify-center rounded-full size-12 bg-background-dark/80 border border-primary/30 text-primary hover:bg-primary/20 transition-colors" disabled={!isARActive}>
                                    <span className="material-symbols-outlined">stop_circle</span>
                                </button>
                            </div>
                        )}

                        {vision.result && !vision.result.isMatch && !isCompleted && (
                            <div className="flex flex-col items-center gap-2 mt-3">
                                <p className="text-red-400 font-mono text-xs tracking-widest">NO MATCH DETECTED</p>
                                {vision.result.description && (
                                    <p className="text-white/40 text-[10px] font-mono text-center max-w-[200px]">{vision.result.description}</p>
                                )}
                                <button
                                    onClick={() => { vision.reset(); captureImage(); }}
                                    className="px-4 py-2 bg-primary/20 border border-primary text-white text-xs font-bold rounded hover:bg-primary/40 transition-colors"
                                >
                                    RETRY SCAN
                                </button>
                            </div>
                        )}

                        {isCompleted && cluePanelNode && (
                            <div className="w-full mt-2">
                                {cluePanelNode}
                            </div>
                        )}

                        {vision.error && (
                            <p className="text-xs text-red-500 font-mono mt-2 bg-black/80 inline-block px-2 rounded">{vision.error}</p>
                        )}
                        {vision.quotaExhausted && (
                            <button
                                onClick={() => vision.manualConfirm()}
                                className="mt-2 px-4 py-2 bg-primary/20 border border-primary text-white text-xs font-bold rounded hover:bg-primary/40 block mx-auto"
                            >
                                BYPASS SCANNER protocol
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
        </div>
    );
};

const Stage05Hierophany: React.FC = () => {
    return (
        <StageWrapper stageId={5} customLayout inlineClue>
            {({ onComplete, isCompleted, cluePanelNode }) => (
                <Stage05Content onComplete={onComplete} isCompleted={isCompleted} cluePanelNode={cluePanelNode} />
            )}
        </StageWrapper>
    );
};

export default Stage05Hierophany;

