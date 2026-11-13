import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StageWrapper from '../components/StageWrapper';
import { useGame } from '../lib/GameContext';

interface Flavor {
    id: number;
    name: string;
    imageUrl: string;
    gradient: string;
    shadowColor: string;
}

const FLAVORS: Flavor[] = [
    {
        id: 0,
        name: 'Blood Orange',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQez1Z43k1M6sKB8mcjp-8oRRtT0VpUykqAqDZpoKVfZLwV9gdZjIaI74z791l7xpGmF5mJgHJoL20MIiw_gYzK5FUl68ghe2SY-2viCuC7Zb9Iq7TZTAQQWmJclp9slDiFCJCpmNcYIZhz09d0vK9djQ7DP9IpJUqrbFvgdAi6uluXUENghSK59snWjfuz8DdSZ7ho9ybXEMMgXMNNj19UgZiMVS8DagoFEEwalvFUZY93fysTS_77B8jDQm2LH3aoZg9gRSWV3PR',
        gradient: 'from-orange-400 to-red-600',
        shadowColor: 'rgba(255,126,0,0.4)',
    },
    {
        id: 1,
        name: 'Blackberry',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8pB-MAoqMIbVGabzXU_C3Lx9iv-BsRtAu5KnbirTP7jlyYLH_dIf1vcskhVR_OhOAqJwqY8PH3HC9aVoDdxMzGqTyAtBIOZYfJBPMGxhHUr8QityHb9AQRxQPQswGi7a66-rycWpLcZ8iZJZwNbArMLth4GZZo1u53FAS-NWeJHPbVMO4UjgIuo9BHuO6LK5pUw0c98Oqh32oH20g8Y3GFeY-giVJYaRwuGklhYvGWmDheGIYMoqDDC6t5PNBXdQXbY776-n7sI3i',
        gradient: 'from-purple-600 to-indigo-900',
        shadowColor: 'rgba(174,62,254,0.4)',
    },
    {
        id: 2,
        name: 'Lemon',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaS-tLv2pHrNahBmbgxxMzOYH6WrQJYyqkp6vPtUKVx3CthrPilbb2GJ4ZGZRzCN6Jh2r5iz48vEzFmax4Y0gL7ViE-95_LxdQexGWlbHvFc4X5sF5yd_VuKIK5DXvt-VU80fhXnHkrNVn9jowLmpmvArG9S78-sv7K5500wPMRcxcLI3df16N3TIr1_JTy63qHX3z-11HDW3FF-hgmKByCDVvcJbKBFz9zvicg14H75gXmPRIBrmCtX_XlsOMUBU82IuLoNEH0os0',
        gradient: 'from-yellow-300 to-yellow-500',
        shadowColor: 'rgba(255,222,0,0.4)',
    },
    {
        id: 3,
        name: 'Mint',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXLE4BeSqnxtpUUvCj1NG_0iOatR1e37zpMyUJUtq1clcW7UCIanbryGJoaGZxW9U9Ys7TDhw-DjJ-QZPmxAvKIEw5oOEYKcYNM6e5vrKb3kJnQ3VO6HenTG_bRZls8A4zxTfTHeJE0DPMn3Tq5gBW9dZwhIhVNmNNw0nXDukTyictgp9CG7bRal22_lj0zw_mgpHYcS07jWHCkhSKdqc4nzTfaRbRobB6HQX8yfZnnFlNbn_KQEEGNqXTiK4YdOTcUsOl8j_hgzRT',
        gradient: 'from-emerald-300 to-teal-600',
        shadowColor: 'rgba(0,255,200,0.4)',
    },
];

const HEX_TARGETS = [
    { hex: '#FF1493', bg: 'bg-[#FF1493]', textColor: 'text-white' },
    { hex: '#00FF00', bg: 'bg-[#00FF00]', textColor: 'text-black' },
    { hex: '#9D00FF', bg: 'bg-[#9D00FF]', textColor: 'text-white' },
    { hex: '#FF69B4', bg: 'bg-[#FF69B4]', textColor: 'text-white' },
];

// Correct mapping: Blood Orange -> #FF1493, Mint -> #00FF00, Blackberry -> #9D00FF, Lemon -> #FF69B4
const CORRECT_MAP: Record<number, number> = { 0: 0, 3: 1, 1: 2, 2: 3 };

const Stage04Gelato: React.FC = () => {
    const navigate = useNavigate();
    const { collectItem } = useGame();
    const [selectedFlavor, setSelectedFlavor] = useState<number | null>(null);
    const [assignments, setAssignments] = useState<Record<number, number>>({}); // slot -> flavorId
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState(false);
    const [isSolved, setIsSolved] = useState(false);

    const assignedFlavors = new Set(Object.values(assignments));
    const allAssigned = Object.keys(assignments).length === 4;

    const handleFlavorTap = (flavorId: number) => {
        if (isSolved || syncing || assignedFlavors.has(flavorId)) return;
        setSelectedFlavor(flavorId);
    };

    const handleSlotTap = (slotIndex: number) => {
        // Note: `isDone` is defined within the StageWrapper's render prop.
        // To make this syntactically correct without further unrelated edits,
        // we use `isSolved` here, which is a state variable and accessible.
        // If `isDone` (which includes `isCompleted` from StageWrapper) was intended,
        // `handleSlotTap` would need to be moved inside the render prop or `isDone` passed as a prop.
        if (isSolved || syncing || selectedFlavor === null) return;
        setAssignments((prev) => {
            const newAssignments = { ...prev };
            // Remove flavor from any existing slot if it was already assigned elsewhere
            for (const [key, val] of Object.entries(newAssignments)) {
                if (val === selectedFlavor) delete newAssignments[Number(key)];
            }
            newAssignments[slotIndex] = selectedFlavor;
            return newAssignments;
        });
        setSelectedFlavor(null);
    };

    const handleSync = (onComplete: () => void) => {
        if (!allAssigned || syncing || isSolved) return;
        setSyncing(true);
        setSyncError(false);

        setTimeout(() => {
            const isCorrect = Object.entries(CORRECT_MAP).every(
                ([flavorId, slotIdx]) => assignments[slotIdx] === Number(flavorId)
            );

            setSyncing(false);
            if (isCorrect) {
                setIsSolved(true);
                // Play success audio
                const audio = new Audio("/success-chime.mp3");
                audio.play().catch(e => console.error("Audio playback failed:", e));
                onComplete();
                collectItem('Frozen Colored Gelato');
            } else {
                setSyncError(true);
                setTimeout(() => {
                    setSyncError(false);
                    setAssignments({});
                }, 1000);
            }
        }, 1200);
    };

    const progressPct = isSolved ? 100 : Math.round((Object.keys(assignments).length / 4) * 71);

    return (
        <StageWrapper stageId={4} customLayout inlineClue>
            {({ onComplete, isCompleted, cluePanelNode }) => {
                const isDone = isCompleted || isSolved;

                return (
                    <div className="bg-background-dark font-display text-white min-h-screen flex flex-col">
                        {/* Header */}
                        <div className="flex items-center bg-background-dark p-4 pb-2 justify-between border-b border-primary/20">
                            <button onClick={() => navigate('/')} className="text-primary flex size-12 shrink-0 items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">chevron_left</span>
                            </button>
                            <div className="flex flex-col items-center">
                                <h2 className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Stage 04</h2>
                                <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">MATCHING FLAVOR FREQUENCIES...</h2>
                            </div>
                            <div className="flex w-12 items-center justify-end">
                                <button className="text-primary"><span className="material-symbols-outlined">info</span></button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex flex-col gap-2 p-4">
                            <div className="flex gap-6 justify-between items-end">
                                <p className="text-solar text-sm font-bold tracking-widest uppercase">Solar Flare Gold Frequencies</p>
                                <p className="text-solar text-lg font-bold leading-none">04</p>
                            </div>
                            <div className="rounded-full bg-white/10 h-1.5 w-full overflow-hidden">
                                <div className="h-full rounded-full bg-solar shadow-[0_0_10px_#ffb622] transition-all duration-500" style={{ width: `${isDone ? 100 : progressPct}%` }}></div>
                            </div>
                            <p className="text-solar/60 text-xs font-mono">STABILIZING: #ffb622</p>
                        </div>

                        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                            {/* Intel Card */}
                            <div className="w-full max-w-md bg-black/40 border border-solar/20 rounded-lg p-3 mb-6">
                                <p className="text-[10px] font-mono text-solar uppercase tracking-widest mb-1">Intel</p>
                                <p className="text-xs text-white/70 leading-relaxed">
                                    The Syndicate fade seems to not affect <span className="text-solar font-bold">The Chromatic Flavors</span>. We should collect <span className="text-primary font-bold">Samples</span> for further analysis.
                                </p>
                            </div>

                            <div className="w-full max-w-md">
                                <h3 className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase text-center mb-8">
                                    {isDone ? 'FREQUENCIES ALIGNED' : 'Select Flavor Orb'}
                                </h3>

                                {/* Flavor Orbs - 2x2 grid */}
                                <div className={`grid grid-cols-2 gap-6 mb-16 ${syncError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                                    {FLAVORS.map((flavor) => {
                                        const isAssigned = assignedFlavors.has(flavor.id);
                                        const isSelected = selectedFlavor === flavor.id;
                                        return (
                                            <button
                                                key={flavor.id}
                                                onClick={() => handleFlavorTap(flavor.id)}
                                                disabled={isDone || isAssigned || syncing}
                                                className={`flex flex-col items-center gap-3 group cursor-pointer active:scale-95 transition-transform ${isAssigned ? 'opacity-40' : ''}`}
                                            >
                                                <div
                                                    className={`size-28 rounded-full bg-gradient-to-br ${flavor.gradient} border-2 flex items-center justify-center overflow-hidden relative ${isSelected ? 'border-acid shadow-[0_0_25px_rgba(204,255,0,0.6)] scale-110' : 'border-white/20'
                                                        }`}
                                                    style={{
                                                        backgroundImage: `url('${flavor.imageUrl}')`,
                                                        backgroundSize: 'cover',
                                                        boxShadow: isSelected ? undefined : `0 0 15px ${flavor.shadowColor}`,
                                                    }}
                                                >
                                                    {isAssigned && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-acid text-3xl">check</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-white text-sm font-bold tracking-wide">{flavor.name}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Hex Targets */}
                            <div className="w-full max-w-md p-6 rounded-xl border-solar/20 bg-white/5 backdrop-blur-md border">
                                <h4 className="text-solar text-xs font-bold leading-normal tracking-[0.2em] mb-6 text-center uppercase">Collect the samples</h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {HEX_TARGETS.map((target, i) => {
                                        const assignedFlavorId = assignments[i];
                                        const flavor = assignedFlavorId !== undefined ? FLAVORS.find((f) => f.id === assignedFlavorId) : null;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleSlotTap(i)}
                                                disabled={isDone || syncing || selectedFlavor === null}
                                                className="flex flex-col items-center gap-2"
                                            >
                                                <div className={`w-full aspect-square rounded-lg border-2 border-dashed flex items-center justify-center bg-black/40 transition-colors ${flavor ? 'border-acid' : selectedFlavor !== null ? 'border-primary hover:border-acid' : 'border-white/20'
                                                    }`}>
                                                    {flavor ? (
                                                        <div
                                                            className="w-full h-full rounded-md bg-cover bg-center"
                                                            style={{ backgroundImage: `url('${flavor.imageUrl}')` }}
                                                        />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-white/20">add</span>
                                                    )}
                                                </div>
                                                <div className={`px-2 py-1 rounded ${target.bg} ${target.textColor} text-[10px] font-mono font-bold`}>
                                                    {target.hex}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-white/40 text-[10px] text-center mt-8 tracking-widest uppercase">
                                    {isDone ? 'Samples collected' : 'This will help us collect samples'}
                                </p>
                            </div>

                            {isDone && cluePanelNode && (
                                <div className="w-full max-w-md mt-6">{cluePanelNode}</div>
                            )}
                        </main>

                        {/* Sync Button */}
                        <div className="p-6 flex flex-col gap-4 mt-auto">
                            {!isDone && (
                                <button
                                    onClick={() => handleSync(onComplete)}
                                    disabled={!allAssigned || syncing || isDone}
                                    className={`w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${allAssigned && !syncing
                                        ? 'bg-primary text-white shadow-[0_0_20px_rgba(174,62,254,0.3)] hover:brightness-110 active:scale-[0.98]'
                                        : 'bg-white/10 text-white/40'
                                        }`}
                                >
                                    <span>{syncing ? 'SYNCING...' : 'INITIALIZE SYNC'}</span>
                                    {!syncing && <span className="material-symbols-outlined">bolt</span>}
                                </button>
                            )}
                        </div>

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

export default Stage04Gelato;
