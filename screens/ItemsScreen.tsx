import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../lib/GameContext';
import { CLUES } from '../lib/clues';

const MINERAL_DATA: Record<string, {
    name: string;
    refId: string;
    image?: string;
    src?: string;
    description: string;
    color?: string;
    stability?: string;
}> = {
    'Blue Calcite': {
        name: 'Blue Calcite',
        refId: 'MIN-001',
        image: 'https://storage.googleapis.com/dimitridon-studios.appspot.com/franknoir/blue_calcite.png',
        description: 'Vibrant blue crystalline structure. Indicates high psionic resonance.',
        color: '#3b82f6'
    },
    'Citrine': {
        name: 'Citrine',
        refId: 'MIN-002',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvVL0M4KJmgYwpYa11ZBTiHu6xQZniHVymraiK0ydwQMwTF0KIDDardsN6CKsrw1h4bSehw4jK5naCpC26bPr3N5ikGNLV-lHg3go4rpYJZDEvPlLaAjGBXUoc8JJKA4RHodYwE-tXIBvjhUkwKBE9Y3NephWW-9LJXVsqtWnqbkUGEZVIQlB7rkX8bikiVFFgLiuXSMjJI-dZnLLWj3DKvCQxt2cyVWv5BmZRBXrdzVxm2hE_I2nB_7BvjZRAYtGBdyH_8VIYk5BP',
        description: 'Golden quartz variety. Associated with solar energy and clarity.',
        color: '#fbbf24'
    },
    'Rose Quartz': {
        name: 'Rose Quartz',
        refId: 'MIN-003',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqNiiLKUDZSUfmVAs-AMvvz8sAsG98aa4mIla-cTE6q9p4QWJIm18Pf_yv_QkWApvlNLIzc_l7K9dxH07mFSYOrLZNTEh9xm6x8C_k5XGitnfGFq-gJPQStI3bDO57rHhll29FCp2_liYZCHmegyuY3C5fOx9SBC9UVy1euz1lvWqyrUaq7ZwyzzcAUNuV9o-0vxkpemfzzZq5ziT2Li4jMBJn-8wWbS90MJ-gARhs7Z_GBBDbZPPmHHA_qem3oqty5z8aTEwIjpWA',
        description: 'Pink crystalline form. Resonates with emotional frequencies.',
        color: '#f472b6'
    },
    'Obsidian': {
        name: 'Obsidian',
        refId: '404-OB',
        stability: '12.1%',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDPCyD1PVSFd5NlzCdlSWWdqX430qCP9Kuobjlg_SetTjQrdqj5yc6ifU37LLvTtre0hZc92C4tqQqgdoJIvi6gOElwLw6tSe-mBKmP4OdosC14GbzhFIen9vjBWXP959Yo9UbQd-ig5JIbRZ_9_n0EtDTVJ5fNbZ4WBOWVandYbaB6Va204vGJOO3Y_zWQP59wkPPfszXwoEd2NKHNIjA1RtzEgmmZW0ESYOUtvcmUSO2az0sc2XwJpAcztCsJQbKLIRDGtLHllRe',
        description: 'A black stone of protection, grounding, and truth.',
    },
    'Spectral Ink': {
        name: 'Spectral Ink',
        refId: 'ART-001',
        src: '/gunInk.jpg',
        description: 'A bottle of ink that shifts colors when observed. Used for writing on the veil.',
        color: '#a855f7'
    },
    'Glass Flower Chandelier': {
        name: 'Glass Flower Chandelier',
        refId: 'ART-002',
        src: '/sleepyBeeFlowers.webp',
        description: 'Delicate glasswork resembling blooming flowers. Emits a faint hum.',
        color: '#fbbf24'
    },
    'Frozen Colored Gelato': {
        name: 'Frozen Colored Gelato',
        refId: 'FOO-001',
        src: '/sleepyBeeFlowers.webp',
        description: 'A scoop of gelato that never melts. Tastes like childhood memories.',
        color: '#f472b6'
    }
};

const VIDEO_ITEMS: Record<string, { name: string; refId: string; videoSrc: string; description: string }> = {
    'Prism Gaze Video': {
        name: 'Prism Gaze',
        refId: 'VID-005',
        videoSrc: 'https://storage.googleapis.com/dimitridon-studios.appspot.com/franknoir/prism_gaze_v1.mp4',
        description: 'Fragment recovered from the Hierophany. A gaze into the prism.'
    },
    'Couple Video': {
        name: 'Memory: Couple',
        refId: 'VID-006',
        videoSrc: '/Video_Updated_To_Resemble_Couple2.mp4',
        description: 'Restored memory sequence. Two figures, intertwined fates.'
    }
};

const ItemsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { inventory, isStageUnlocked } = useGame();
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ITEMS' | 'EVIDENCE'>('ITEMS');
    const [selectedClue, setSelectedClue] = useState<typeof CLUES[0] | null>(null);

    // Calculate collected clues based on unlocked stages
    // A clue is "FOUND" if the NEXT stage is unlocked (meaning current stage completed)
    // OR if we treat stage complete as finding the clue.
    // Let's use isStageUnlocked(stageId + 1) to check if stageId is completed?
    // Actually, useGame has getStageStatus.
    // Let's just iterate CLUES and check if stageId status is 'completed'.
    // BUT useGame might not expose check for specific stage completion easily without getStageStatus.

    // Let's assume if stageId is unlocked, maybe we found it? 
    // Usually evidence is found AT THE END of a stage. So if stageId is COMPLETED.
    // We can use isStageUnlocked(stageId + 1) as a proxy for stageId completed, 
    // but better to check if stageId is completed directly if possible.
    // The useGame hook has `getStageStatus`. We need to use it.
    // inventory only tracks string item names.

    // We need to import CLUES.
    // And Clue type. 
    // Since we are inside the component, we can use the imported CLUES.

    const getClueStatus = (stageId: number) => {
        // If the stage is completed, the clue is found.
        // We don't have direct access to 'completed' status easily without iterating?
        // useGame provides isStageUnlocked. 
        // If stage N+1 is unlocked, stage N is complete.
        // Special case: Stage 15.
        // Let's use isStageUnlocked(stageId + 1) for stages < 15.
        // For Stage 15, we might need a specific check or if the game is "won".
        if (stageId === 15) {
            // For now assume if 15 is unlocked we see it? No, need to finish 15.
            // Let's just say if Stage 14 is complete? 
            // Logic: Evidence from Stage X is found when Stage X is complete.
            return isStageUnlocked(stageId + 1) ? 'FOUND' : 'LOCKED';
        }
        return isStageUnlocked(stageId + 1) ? 'FOUND' : 'LOCKED';
    };

    return (
        <div className="bg-background-dark min-h-screen text-white flex flex-col font-display">
            {/* Background Noise */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[0] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background-dark/90 backdrop-blur-md border-b border-primary/20">
                <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-white/80 hover:text-white transition-colors">arrow_back</button>
                        <h1 className="text-lg font-bold tracking-widest text-white uppercase">ARCHIVE</h1>
                    </div>
                    <div className="text-xs font-mono text-acid">
                        {activeTab === 'ITEMS' ? `ITEMS: ${inventory.length}` : 'EVIDENCE LOG'}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-t border-white/5">
                    <button
                        onClick={() => setActiveTab('ITEMS')}
                        className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors relative ${activeTab === 'ITEMS' ? 'text-acid bg-white/5' : 'text-white/40 hover:text-white/60'}`}
                    >
                        Artifacts
                        {activeTab === 'ITEMS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-acid"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('EVIDENCE')}
                        className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase transition-colors relative ${activeTab === 'EVIDENCE' ? 'text-acid bg-white/5' : 'text-white/40 hover:text-white/60'}`}
                    >
                        Evidence
                        {activeTab === 'EVIDENCE' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-acid"></div>}
                    </button>
                </div>
            </header>

            <main className="flex-1 pt-32 px-4 pb-24 flex flex-col gap-6 relative z-10">
                {activeTab === 'ITEMS' ? (
                    inventory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] opacity-50">
                            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">inventory_2</span>
                            <p className="font-mono text-sm tracking-widest text-center">NO ARTIFACTS</p>
                            <p className="text-xs text-center mt-2 max-w-xs">Complete stages to verify and collect items for the protocol.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {inventory.map((itemName, index) => {
                                const mineral = MINERAL_DATA[itemName];
                                const video = VIDEO_ITEMS[itemName];
                                if (mineral) {
                                    return (
                                        <div key={index} className="bg-surface-dark border border-primary/20 rounded-xl p-4 flex gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/50">
                                                <img
                                                    src={mineral.src || mineral.image}
                                                    alt={mineral.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent && !parent.querySelector('.fallback-icon')) {
                                                            const fallback = document.createElement('div');
                                                            fallback.className = 'fallback-icon w-full h-full flex items-center justify-center';
                                                            fallback.style.backgroundColor = mineral.color || '#ae3efe';
                                                            fallback.style.opacity = '0.3';
                                                            fallback.innerHTML = '<span class="material-symbols-outlined text-white text-2xl">diamond</span>';
                                                            parent.appendChild(fallback);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-bold text-acid tracking-wide">{mineral.name}</h3>
                                                    <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">{mineral.refId}</span>
                                                </div>
                                                <p className="text-xs text-white/60 font-mono mb-2">STABILITY: {mineral.stability || 'UNKNOWN'}</p>
                                                <p className="text-sm text-white/80 leading-snug">{mineral.description}</p>
                                            </div>
                                        </div>
                                    );
                                } else if (video) {
                                    return (
                                        <div key={index} className="bg-surface-dark border border-primary/20 rounded-xl p-4 flex gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer hover:bg-white/5 transition-colors" style={{ animationDelay: `${index * 100}ms` }} onClick={() => setPlayingVideo(video.videoSrc)}>
                                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/50 relative flex items-center justify-center group">
                                                <video src={video.videoSrc} className="w-full h-full object-cover opacity-50" />
                                                <span className="material-symbols-outlined absolute text-white opacity-80 group-hover:scale-110 transition-transform text-3xl shadow-lg">play_circle</span>
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-lg font-bold text-acid tracking-wide">{video.name}</h3>
                                                    <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">{video.refId}</span>
                                                </div>
                                                <p className="text-xs text-white/60 font-mono mb-2">VIDEO LOG</p>
                                                <p className="text-sm text-white/80 leading-snug">{video.description}</p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )
                ) : (
                    // EVIDENCE TAB
                    <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto w-full">
                        {CLUES.map((clue) => {
                            const status = getClueStatus(clue.stageId);
                            return (
                                <div
                                    key={clue.id}
                                    onClick={() => status === 'FOUND' && setSelectedClue(clue)}
                                    className={`relative group border rounded-lg p-4 transition-all duration-300 ${status === 'FOUND'
                                        ? 'bg-[#151018] border-white/20 hover:border-acid/50 cursor-pointer hover:bg-white/5'
                                        : 'bg-black border-white/5 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded flex items-center justify-center border ${status === 'FOUND' ? 'bg-acid/10 border-acid text-acid' : 'bg-white/5 border-white/10 text-white/20'
                                                }`}>
                                                <span className="material-symbols-outlined">
                                                    {clue.type === 'PAPER' ? 'description' : clue.type === 'AUDIO' ? 'graphic_eq' : 'extension'}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className={`text-sm font-bold tracking-widest uppercase ${status === 'FOUND' ? 'text-white' : 'text-white/30'}`}>
                                                    {status === 'FOUND' ? clue.title : 'ENCRYPTED DATA'}
                                                </h3>
                                                <p className="text-[10px] font-mono text-white/40">
                                                    STAGE {String(clue.stageId).padStart(2, '0')} // {status === 'FOUND' ? clue.date : 'LOCKED'}
                                                </p>
                                            </div>
                                        </div>
                                        {status === 'FOUND' ? (
                                            <span className="material-symbols-outlined text-acid opacity-0 group-hover:opacity-100 transition-opacity">visibility</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-white/20">lock</span>
                                        )}
                                    </div>

                                    {status === 'FOUND' && (
                                        <p className="text-xs text-white/60 font-mono line-clamp-1 pl-[52px]">
                                            "{clue.content}"
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Video Modal */}
            {playingVideo && (
                <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center animate-in fade-in duration-300">
                    <button onClick={() => setPlayingVideo(null)} className="absolute top-8 right-8 text-white z-50 bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors">
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <video src={playingVideo} controls autoPlay className="w-full h-full max-h-screen object-contain" />
                </div>
            )}

            {/* Evidence Modal */}
            {selectedClue && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedClue(null)}>
                    <div className="w-full max-w-md bg-[#1a1a1a] border border-acid/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(204,255,0,0.1)] relative" onClick={e => e.stopPropagation()}>
                        {/* Glitch Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover mix-blend-overlay"></div>

                        <div className="bg-acid/10 p-4 border-b border-acid/20 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-acid">warning</span>
                                <h2 className="text-acid text-xs font-bold tracking-[0.2em] uppercase">Message Intercepted</h2>
                            </div>
                            <button onClick={() => setSelectedClue(null)} className="text-white/50 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8 flex flex-col items-center gap-6">
                            {/* Typewriter Effect Container */}
                            <div className="w-full bg-[#000] p-6 rounded border border-white/10 relative shadow-inner">
                                <span className="absolute -top-3 left-4 bg-[#1a1a1a] px-2 text-[10px] text-acid font-mono">DECODED_TEXT</span>
                                <p className="text-lg text-white font-mono leading-relaxed tracking-wide">
                                    <span className="text-acid">"</span>{selectedClue.content}<span className="text-acid">"</span>
                                </p>
                                <div className="h-4 w-full flex justify-end mt-4">
                                    <span className="block w-2 h-4 bg-acid animate-pulse"></span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="size-16 rounded-full overflow-hidden border-2 border-white/20 grayscale">
                                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0Q7yh3UCOppv1XnBgS2thngwIXT79M86he7xTBmDmFZ-w1ngOE_h65eGIu8xiNKMQEPkebNTZaDOfCsR0Vh0haBzp1TuzjPT0jsIePq3agnFP5H7vpkhMAF1wLhcAwxHur4SHrIo2a2N_Z1vjnLPrTPU_VNsYf3ocD9jzi6DuVsZNWym3P8EjzxGLHCT4H1yOTb0-bs_5-QuJZYQt8-VtZBG_bkjyhi2l_ER0DKP9U0bLmup1aIBgq3nXrPMBhUYmId_OWdeHLziw" className="w-full h-full object-cover" alt="Editor Profile" />
                                </div>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Signed: The Editor</p>
                            </div>
                        </div>

                        <div className="p-4 bg-black/50 border-t border-white/10 text-center">
                            <p className="text-[10px] text-red-500 font-mono animate-pulse">TRACE_PROGRAM_DETECTED... CONNECTION UNSTABLE</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemsScreen;
