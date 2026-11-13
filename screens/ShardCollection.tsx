import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Shard Data Definitions
const SHARDS = [
  { id: '01', title: 'ORIGIN SPARK', color: '#ccff00', shape: 'M50 5 L90 25 L80 75 L50 95 L20 75 L10 25 Z', lore: 'The initial ignition. A fragment of raw possibility from the starting line.' },
  { id: '02', title: 'HIVE HEX', color: '#ae3efe', shape: 'M50 0 L95 25 L95 75 L50 100 L5 75 L5 25 Z', lore: 'Crystallized collective consciousness. Buzzing with recursive data.' },
  { id: '03', title: 'TUNER FORK', color: '#00ffff', shape: 'M30 5 L70 5 L60 95 L40 95 Z', lore: 'Resonates at 14.02 MHz. A physical manifestation of a soundwave.' },
  { id: '04', title: 'ALCOVE LENS', color: '#ffffff', shape: 'M50 10 C90 10 90 90 50 90 C10 90 10 10 50 10 Z', lore: 'A pane of solidified memory. Distorts light to reveal hidden layers.' },
  { id: '05', title: 'GOLDEN ORB', color: '#ffb622', shape: 'M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0', lore: 'Sugary, solar-charged matter. Tastes like nostalgia.' },
  { id: '06', title: 'LEAF FRACTAL', color: '#39ff14', shape: 'M50 5 Q90 5 90 50 Q50 95 50 95 Q50 95 10 50 Q10 5 50 5', lore: 'Bio-digital organic matter. Contains the DNA of the conservatory.' },
  { id: '07', title: 'ELIXIR DROP', color: '#f53fe8', shape: 'M50 5 Q95 60 50 95 Q5 60 50 5', lore: 'A solidified droplet of the cure. Vibrates with healing frequencies.' },
  { id: '08', title: 'PIXEL CUBE', color: '#ff0055', shape: 'M25 25 L75 25 L75 75 L25 75 Z', lore: 'A perfect cube of void data. Heavy with artistic intent.' },
  { id: '09', title: 'TWIN PEAK', color: '#00f2ff', shape: 'M50 5 L80 50 L50 95 L20 50 Z', lore: 'Symmetrical reflection shard. Shows two versions of the truth.' },
  { id: '10', title: 'SMOKE QUARTZ', color: '#581c87', shape: 'M50 10 L80 30 L90 70 L50 90 L10 70 L20 30 Z', lore: 'Clouded by the fog. Cold to the touch.' },
  { id: '11', title: 'KEYSTONE', color: '#f97316', shape: 'M20 20 L80 20 L70 80 L30 80 Z', lore: 'A fragment of security. Unlocks the safe house protocol.' },
  { id: '12', title: 'BRICK MATRIX', color: '#ef4444', shape: 'M10 30 L30 30 L30 10 L70 10 L70 30 L90 30 L90 90 L10 90 Z', lore: 'Modular reality block. Can be reassembled into anything.' },
  { id: '13', title: 'SPORE GEM', color: '#a3e635', shape: 'M50 10 Q90 10 90 40 Q90 80 50 90 Q10 80 10 40 Q10 10 50 10', lore: 'Glows in the dark. Emits a faint hum.' },
  { id: '14', title: 'COMPASS STAR', color: '#d946ef', shape: 'M50 0 L65 35 L100 50 L65 65 L50 100 L35 65 L0 50 L35 35 Z', lore: 'Points towards the anomaly. Glitches frequently.' },
  { id: '15', title: 'OMEGA DIAMOND', color: '#ffffff', shape: 'M50 0 L100 40 L50 100 L0 40 Z', lore: 'The final piece to conclude The Fade protocol.' },
];

import { useGame } from '../lib/GameContext';

const ShardCollection: React.FC = () => {
  const navigate = useNavigate();
  const { getStageStatus, markShardsViewed } = useGame();
  const [selectedShard, setSelectedShard] = useState<typeof SHARDS[0] | null>(null);

  // Clear new shard badge on mount
  useEffect(() => {
    markShardsViewed();
  }, [markShardsViewed]);

  // Helper to check if shard is unlocked based on stage completion
  const isShardUnlocked = (shardId: string) => {
    const stageId = parseInt(shardId, 10);
    // Stage N completion unlocks Shard N
    return getStageStatus(stageId) === 'completed';
  };

  return (
    <div className="bg-background-dark font-display text-white min-h-screen flex flex-col relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0510] to-black"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-acid animate-shimmer"></div>

      <header className="relative z-20 flex items-center justify-between p-6 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <button onClick={() => navigate('/')} className="text-white hover:text-primary transition-colors flex items-center justify-center size-10 rounded-full border border-white/10">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase">Chronological Archive</span>
          <h1 className="text-lg font-bold uppercase tracking-wide text-white shadow-neon">Crystal Bank</h1>
        </div>
        <div className="size-10 flex items-center justify-center rounded-full bg-primary/10 border border-primary/30">
          <span className="material-symbols-outlined text-primary text-xl">diamond</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
        <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
          {SHARDS.map((shard) => (
            <button
              key={shard.id}
              onClick={() => setSelectedShard(shard)}
              className="relative aspect-[3/4] group focus:outline-none"
            >
              {/* Card Container */}
              <div className={`absolute inset-0 rounded-xl border transition-all duration-300 ${isShardUnlocked(shard.id)
                ? 'bg-white/5 border-white/20 hover:border-white/50 hover:bg-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                : 'bg-black/40 border-white/5 grayscale opacity-60'
                }`}>
                {/* Shard Rendering */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg transition-transform group-hover:scale-110 duration-500">
                    <defs>
                      <linearGradient id={`grad-${shard.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={shard.color} stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                      </linearGradient>
                      <filter id={`glow-${shard.id}`}>
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <path
                      d={shard.shape}
                      fill={isShardUnlocked(shard.id) ? `url(#grad-${shard.id})` : 'transparent'}
                      stroke={isShardUnlocked(shard.id) ? shard.color : '#444'}
                      strokeWidth={isShardUnlocked(shard.id) ? "1" : "0.5"}
                      strokeDasharray={isShardUnlocked(shard.id) ? "" : "4 2"}
                      filter={isShardUnlocked(shard.id) ? `url(#glow-${shard.id})` : ''}
                      className={isShardUnlocked(shard.id) ? 'animate-pulse-fast' : ''}
                      style={{ animationDuration: '3s' }}
                    />
                  </svg>
                </div>

                {/* Labels */}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className={`text-[9px] font-mono uppercase tracking-wider ${isShardUnlocked(shard.id) ? 'text-white' : 'text-white/30'}`}>
                    {isShardUnlocked(shard.id) ? shard.id : 'LOCKED'}
                  </span>
                </div>

                {/* Lock Icon */}
                {!isShardUnlocked(shard.id) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/20 text-3xl">lock</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Detail Overlay */}
      {selectedShard && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#100a15] w-full max-w-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-acid"></div>
            <button
              onClick={() => setSelectedShard(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="p-8 flex flex-col items-center text-center gap-6">
              {/* Large Shard Display */}
              <div className="size-32 relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  <path
                    d={selectedShard.shape}
                    fill={isShardUnlocked(selectedShard.id) ? selectedShard.color : '#1a1a1a'}
                    fillOpacity="0.5"
                    stroke={isShardUnlocked(selectedShard.id) ? selectedShard.color : '#333'}
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <div>
                <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-1">Shard {selectedShard.id}</p>
                <h2 className={`text-2xl font-bold uppercase tracking-tight ${isShardUnlocked(selectedShard.id) ? 'text-white' : 'text-white/40'}`}>
                  {isShardUnlocked(selectedShard.id) ? selectedShard.title : 'Encrypted Signal'}
                </h2>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10 w-full">
                <p className={`text-sm font-mono leading-relaxed ${isShardUnlocked(selectedShard.id) ? 'text-white/80' : 'text-white/20'}`}>
                  {isShardUnlocked(selectedShard.id) ? selectedShard.lore : 'Complete the corresponding stage to decrypt this memory fragment.'}
                </p>
              </div>

              <div className="flex gap-2 w-full">
                <div className="h-1 flex-1 bg-primary/50 rounded-full"></div>
                <div className="h-1 flex-1 bg-secondary/50 rounded-full"></div>
                <div className="h-1 flex-1 bg-acid/50 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <footer className="absolute bottom-0 w-full bg-background-dark/90 border-t border-white/10 p-4 pb-6 backdrop-blur-md z-20">
        <div className="flex justify-between items-end px-4">
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Collection Status</p>
            <p className="text-xl font-bold text-white">{SHARDS.filter(s => isShardUnlocked(s.id)).length} <span className="text-white/40 text-sm">/ {SHARDS.length}</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-acid font-mono uppercase tracking-widest mb-1">Memory Integrity</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-acid transition-all duration-1000"
                  style={{ width: `${(SHARDS.filter(s => isShardUnlocked(s.id)).length / SHARDS.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-acid font-mono text-xs font-bold">{Math.round((SHARDS.filter(s => isShardUnlocked(s.id)).length / SHARDS.length) * 100)}%</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShardCollection;