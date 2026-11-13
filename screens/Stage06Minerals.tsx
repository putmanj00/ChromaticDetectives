import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StageWrapper from '../components/StageWrapper';
import VideoInterstitial from '../components/VideoInterstitial';

const MINERALS = [
    {
        id: 'rose-quartz',
        name: 'Rose Quartz',
        refId: '099-RQ',
        stability: '94.2%',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqNiiLKUDZSUfmVAs-AMvvz8sAsG98aa4mIla-cTE6q9p4QWJIm18Pf_yv_QkWApvlNLIzc_l7K9dxH07mFSYOrLZNTEh9xm6x8C_k5XGitnfGFq-gJPQStI3bDO57rHhll29FCp2_liYZCHmegyuY3C5fOx9SBC9UVy1euz1lvWqyrUaq7ZwyzzcAUNuV9o-0vxkpemfzzZq5ziT2Li4jMBJn-8wWbS90MJ-gARhs7Z_GBBDbZPPmHHA_qem3oqty5z8aTEwIjpWA'
    },
    {
        id: 'citrine',
        name: 'Citrine',
        refId: '112-CT',
        stability: '88.7%',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvVL0M4KJmgYwpYa11ZBTiHu6xQZniHVymraiK0ydwQMwTF0KIDDardsN6CKsrw1h4bSehw4jK5naCpC26bPr3N5ikGNLV-lHg3go4rpYJZDEvPlLaAjGBXUoc8JJKA4RHodYwE-tXIBvjhUkwKBE9Y3NephWW-9LJXVsqtWnqbkUGEZVIQlB7rkX8bikiVFFgLiuXSMjJI-dZnLLWj3DKvCQxt2cyVWv5BmZRBXrdzVxm2hE_I2nB_7BvjZRAYtGBdyH_8VIYk5BP'
    },
    {
        id: 'obsidian',
        name: 'Obsidian',
        refId: '404-OB',
        stability: '12.1%',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDPCyD1PVSFd5NlzCdlSWWdqX430qCP9Kuobjlg_SetTjQrdqj5yc6ifU37LLvTtre0hZc92C4tqQqgdoJIvi6gOElwLw6tSe-mBKmP4OdosC14GbzhFIen9vjBWXP959Yo9UbQd-ig5JIbRZ_9_n0EtDTVJ5fNbZ4WBOWVandYbaB6Va204vGJOO3Y_zWQP59wkPPfszXwoEd2NKHNIjA1RtzEgmmZW0ESYOUtvcmUSO2az0sc2XwJpAcztCsJQbKLIRDGtLHllRe'
    },
] as const;

const CORRECT_ORDER = ['obsidian', 'citrine', 'rose-quartz'];

const Stage06MineralsContent: React.FC<{ onComplete: () => void; isCompleted: boolean; cluePanelNode: React.ReactNode }> = ({ onComplete, isCompleted, cluePanelNode }) => {
    const navigate = useNavigate();
    const [tappedOrder, setTappedOrder] = useState<string[]>([]);
    const [shakeError, setShakeError] = useState(false);
    const [solved, setSolved] = useState(false);
    const [showPostVideo, setShowPostVideo] = useState(false);
    const completedRef = useRef(false);

    const handleTap = (mineralId: string) => {
        if (isActuallyDone || shakeError || tappedOrder.includes(mineralId)) return;

        setTappedOrder((prev) => {
            const next = [...prev, mineralId];
            const nextIndex = next.length - 1;

            if (mineralId !== CORRECT_ORDER[nextIndex]) {
                setShakeError(true);
                setTimeout(() => {
                    setShakeError(false);
                    setTappedOrder([]);
                }, 800);
                return prev;
            }

            if (next.length === 3) {
                setSolved(true);
                if (!completedRef.current) {
                    completedRef.current = true;
                    setTimeout(() => setShowPostVideo(true), 1000);
                }
            }
            return next;
        });
    };

    const isActuallyDone = isCompleted || solved;

    if (showPostVideo) {
        return (
            <VideoInterstitial
                src="/Video_Updated_To_Resemble_Couple2.mp4"
                onComplete={() => {
                    setShowPostVideo(false);
                    onComplete();
                }}
                title="MEMORY RECOVERED"
            />
        );
    }

    return (
        <div className={`bg-background-dark font-display text-acid min-h-screen flex flex-col border-4 border-primary/20 relative ${shakeError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            <div className="absolute inset-0 opacity-30 z-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }}></div>

            <header className="relative z-20 flex items-center justify-between p-4 bg-black border-b border-primary/30">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="material-symbols-outlined text-primary text-3xl hover:text-acid transition-colors">terminal</button>
                    <div className="flex flex-col">
                        <h1 className="text-acid text-sm md:text-lg font-bold tracking-widest uppercase">SYSTEM_DIAGNOSTIC: MINERAL_ID_MODE</h1>
                        <p className="text-[10px] text-primary/80 uppercase tracking-tighter">Dimitridon Studios v6.0.4</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="size-2 rounded-full bg-acid"></div>
                    <div className={`size-2 rounded-full bg-primary ${!isActuallyDone ? 'animate-pulse' : ''}`}></div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-6 gap-6 relative overflow-y-auto z-10">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Intel</p>
                    <p className="text-xs text-white/70 leading-relaxed">
                        The minerals at <span className="text-acid font-bold">Dimitridon Studios</span> hold fragments of crystallized memory. Each stone resonates at a different <span className="text-primary font-bold">spectral frequency</span>. Identify the correct sequence to decode the lattice and recover the crystal shard.
                    </p>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg shrink-0">
                    <p className="text-acid text-xs font-bold mb-1 opacity-70 tracking-[0.2em]">MISSION_OBJECTIVE</p>
                    <p className="text-white text-xl font-bold uppercase tracking-tight">SEQUENCE REQUIRED: <span className="text-primary tracking-widest">{isActuallyDone ? 'DECODED' : '[REDACTED]'}</span></p>
                    <div className="mt-3 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div className="bg-acid h-full transition-all duration-300" style={{ width: `${(tappedOrder.length / 3) * 100}%` }}></div>
                    </div>
                    {isActuallyDone && cluePanelNode && (
                        <div className="mt-4 pt-4 border-t border-primary/20">
                            {cluePanelNode}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 py-4">
                    {MINERALS.map((mineral) => {
                        const isSelected = tappedOrder.includes(mineral.id);

                        return (
                            <button
                                key={mineral.id}
                                onClick={() => handleTap(mineral.id)}
                                disabled={isActuallyDone || isSelected}
                                className={`group relative flex flex-col items-center justify-center gap-4 transition-transform active:scale-95 ${isSelected ? 'opacity-50 grayscale' : ''}`}
                            >
                                <div className={`relative w-full aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center p-2 border-2 shadow-[0_0_15px_#ae3efe] ${isActuallyDone ? 'border-acid' : 'border-primary'}`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                    <img alt={mineral.name} className="w-full h-full object-cover" src={mineral.src} />
                                    <div className="absolute bottom-2 left-2 z-20">
                                        <p className="text-white text-[10px] font-bold tracking-tighter opacity-50">REF_ID: {mineral.refId}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-primary/20 z-30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-white">check</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <h2 className="text-acid text-base font-black tracking-widest uppercase group-hover:text-white transition-colors">{mineral.name}</h2>
                                    <p className="text-primary text-[10px] font-bold">STABILITY: {mineral.stability}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>

            <footer className="relative z-20 p-6 bg-black border-t-2 border-primary/40 flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">analytics</span>
                        <p className="text-acid text-xs font-bold tracking-[0.2em]">SPECTRAL STABILITY</p>
                    </div>
                    <p className="text-primary text-xs font-bold">65% OVERRIDE</p>
                </div>
                <div className="w-full h-6 bg-primary/10 rounded-full border border-primary/30 p-1 relative overflow-hidden">
                    <div className="h-full bg-primary rounded-full shadow-[0_0_20px_#ae3efe]" style={{ width: "65%" }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-primary uppercase">
                    <span>[ CHANNEL_ALPHA ]</span>
                    <span className="text-acid underline underline-offset-4 decoration-1">Tap Minerals in Frequency Order</span>
                    <span>[ DIM_STU_77 ]</span>
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
};

const Stage06Minerals: React.FC = () => {
    return (
        <StageWrapper
            stageId={6}
            customLayout
            inlineClue
        >
            {(props) => <Stage06MineralsContent {...props} />}
        </StageWrapper>
    );
};

export default Stage06Minerals;
