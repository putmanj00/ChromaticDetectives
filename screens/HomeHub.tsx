import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../lib/GameContext';
import { STAGES } from '../lib/stages';
import AdminPanel from '../components/AdminPanel';
import VideoInterstitial from '../components/VideoInterstitial';

const HomeHub: React.FC = () => {
  const navigate = useNavigate();
  const { getStageStatus, completedCount, totalStages, resetGame, forceUnlock, newShardCount } = useGame();
  const [showAdmin, setShowAdmin] = useState(false);

  const [showIntroVideo, setShowIntroVideo] = useState(() => {
    const videoPlayed = localStorage.getItem('intro_video_played_v2');
    return !videoPlayed;
  });

  const [showBrief, setShowBrief] = useState(() => {
    const videoPlayed = localStorage.getItem('intro_video_played_v2');
    const dismissed = localStorage.getItem('mission_brief_dismissed_v2');
    // If video hasn't played, we show video first, so brief is false for now.
    // If video HAS played, we check if brief was dismissed.
    if (!videoPlayed) return false;
    return !dismissed;
  });

  const [titleTapCount, setTitleTapCount] = useState(0);

  const handleIntroVideoComplete = () => {
    localStorage.setItem('intro_video_played_v2', 'true');
    setShowIntroVideo(false);
    const dismissed = localStorage.getItem('mission_brief_dismissed_v2');
    if (!dismissed) {
      setShowBrief(true);
    }
  };

  const handleDismissBrief = () => {
    setShowBrief(false);
    localStorage.setItem('mission_brief_dismissed_v2', 'true');
    // Also mark video as played to be safe, though it should be already
    localStorage.setItem('intro_video_played_v2', 'true');
  };

  const progressPercent = Math.round((completedCount / totalStages) * 100);

  const handleTitleTap = () => {
    const next = titleTapCount + 1;
    setTitleTapCount(next);
    if (next >= 3) {
      setShowAdmin(true);
      setTitleTapCount(0);
    }
    // Reset tap count after 2 seconds of inactivity
    setTimeout(() => setTitleTapCount(0), 2000);
  };

  const menuItems = STAGES.map((stage) => {
    const status = getStageStatus(stage.id);
    const statusLabel =
      status === 'completed' ? 'COMPLETE' :
        status === 'active' ? 'ACTIVE' :
          status === 'unlocked' ? 'READY' :
            'LOCKED';

    return {
      id: String(stage.id).padStart(2, '0'),
      title: stage.title,
      status: statusLabel,
      route: stage.route,
    };
  });

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden pb-hub-nav bg-background-dark text-white">
      {/* Background Noise */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[0] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background-dark border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col w-full">
          {/* Top Status Bar */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-[#050308]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-acid text-sm">terminal</span>
              <span className="text-acid font-mono text-[10px] font-bold tracking-widest leading-none mt-0.5">SYS.ROOT.USER_404</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#f53fe8]"></span>
                <span className="text-secondary font-mono text-[10px] font-bold tracking-widest leading-none mt-0.5">CONNECTED</span>
              </div>
            </div>
          </div>

          {/* Protocol Pulse Row */}
          <div className="flex justify-between items-end px-4 py-3 pb-1">
            <h2 className="text-white text-sm font-black tracking-widest uppercase italic">PROTOCOL PULSE</h2>
            <p className="text-secondary text-xs font-mono font-bold tracking-widest">{progressPercent}% {completedCount === totalStages ? 'COMPLETE' : 'STABLE'}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#1a1020] relative overflow-hidden">
            <div className="absolute inset-0 z-10 opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.5)_50%,transparent_100%)] w-full animate-shimmer"></div>
            <div className="h-full bg-gradient-to-r from-secondary to-primary shadow-[0_0_15px_#f53fe8] transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-6 px-4 pb-4 pt-32 relative z-10">
        <div className="pt-2" onClick={handleTitleTap}>
          <p className="text-acid font-mono text-xs mb-1 opacity-70">&gt; INITIATING SEQUENCE...</p>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-[0.9] uppercase relative select-none">
            THE FADE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-pulse">PROTOCOL</span>
          </h1>
        </div>

        {/* Timeline */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-white text-lg font-bold tracking-tight">TIMELINE DATA</h3>
            <span className="text-[10px] font-mono text-acid bg-acid/10 px-2 py-1 rounded border border-acid/20">v14.0.2</span>
          </div>

          <div className="relative pl-4 space-y-0 before:absolute before:inset-0 before:left-6 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-secondary before:to-transparent">
            {menuItems.map((item, idx) => (
              <div key={item.id} className={`relative pl-8 ${idx === menuItems.length - 1 ? '' : 'pb-8'} cursor-pointer`} onClick={() => navigate(item.route)}>
                {/* Node Dot */}
                <span className={`absolute left-[1px] top-1 -ml-px h-4 w-4 rounded-full border-2 border-black ${item.status === 'COMPLETE' ? 'bg-primary' :
                  item.status === 'ACTIVE' ? 'bg-secondary shadow-[0_0_10px_#f53fe8]' :
                    item.status === 'READY' ? 'bg-acid shadow-[0_0_10px_#ccff00]' :
                      'bg-gray-700'
                  }`}></span>

                <div className={`flex flex-col gap-2 rounded-lg p-3 border transition-all ${item.status === 'ACTIVE' ? 'bg-[#151018] border-secondary/30 shadow-[0_0_5px_theme("colors.secondary")]' :
                  item.status === 'READY' ? 'bg-[#101510] border-acid/20' :
                    item.status === 'COMPLETE' ? 'bg-[#0a050d] border-primary/20 opacity-70' :
                      'bg-[#0a050d] border-white/5 opacity-50'
                  }`}>
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-bold ${item.status === 'COMPLETE' ? 'text-primary line-through' :
                      item.status === 'ACTIVE' ? 'text-white' :
                        item.status === 'READY' ? 'text-acid' :
                          'text-gray-500'
                      }`}>STAGE {item.id}: {item.status === 'LOCKED' ? 'CLASSIFIED' : item.title}</h4>
                    {item.status === 'ACTIVE' && <span className="material-symbols-outlined text-acid text-sm animate-spin">sync</span>}
                    {item.status === 'LOCKED' && <span className="material-symbols-outlined text-gray-600 text-sm">lock</span>}
                    {item.status === 'COMPLETE' && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                    {item.status === 'READY' && <span className="material-symbols-outlined text-acid text-sm">lock_open</span>}
                  </div>
                  {item.status === 'ACTIVE' && (
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded font-mono border border-secondary/20">ACTIVE</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Dock */}
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        <div className="mx-auto max-w-md bg-[#0a050d]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.8)] px-2 py-2 flex justify-around items-center">
          <button className="flex flex-col items-center gap-1 p-2 group">
            <span className="material-symbols-outlined text-primary text-[28px]">home_app_logo</span>
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Hub</span>
            <div className="h-1 w-1 rounded-full bg-primary mt-1 shadow-[0_0_5px_#ac3cfe]"></div>
          </button>
          <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-1 p-2 group">
            <span className="material-symbols-outlined text-white/40 group-hover:text-acid transition-colors text-[24px]">map</span>
            <span className="text-[9px] font-bold text-white/40 group-hover:text-white uppercase tracking-wider">Map</span>
          </button>
          <button onClick={() => navigate('/items')} className="flex flex-col items-center gap-1 p-2 group">
            <span className="material-symbols-outlined text-white/40 group-hover:text-acid transition-colors text-[24px]">inventory_2</span>
            <span className="text-[9px] font-bold text-white/40 group-hover:text-white uppercase tracking-wider">Items</span>
          </button>
          <button onClick={() => navigate('/shards')} className="flex flex-col items-center gap-1 p-2 group relative">
            <span className="material-symbols-outlined text-white/40 group-hover:text-acid transition-colors text-[24px]">diamond</span>
            <span className="text-[9px] font-bold text-white/40 group-hover:text-white uppercase tracking-wider">Crystals</span>
            {newShardCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white animate-pulse shadow-[0_0_8px_#f53fe8] border border-black">
                {newShardCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onReset={resetGame}
          onForceUnlock={forceUnlock}
        />
      )}

      {/* Intro Video */}
      {showIntroVideo && (
        <VideoInterstitial
          src="/Cinematic_Neon_to_Greyscale_Fade.mp4"
          onComplete={handleIntroVideoComplete}
          title="THE FADE"
          subtitle="SYSTEM INITIALIZING..."
        />
      )}

      {/* Mission Brief Modal */}
      {showBrief && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#100a15] rounded-xl border border-primary/30 shadow-[0_0_30px_rgba(174,62,254,0.3)] overflow-hidden flex flex-col relative">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary via-acid to-secondary"></div>

            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-acid animate-pulse">terminal</span>
                <h2 className="text-acid text-xs font-bold tracking-[0.2em] uppercase">System Boot...</h2>
              </div>

              <div className="space-y-4 text-xs font-mono leading-relaxed text-white/90">
                <p><strong className="text-primary">INVESTIGATOR STATUS:</strong> Active.</p>
                <p>
                  <strong className="text-secondary">ENVIRONMENTAL DATA:</strong> The "Fade" is draining the spectrum from Prism City. The Monochrome Syndicate has fragmented the chromatic timeline into chronological shards.
                </p>
                <p>
                  <strong className="text-acid">YOUR MISSION:</strong> Stop "The Editor". Recover the Prism Gaze artifact. Restore saturation before the timeline reaches Absolute Black.
                </p>
                <div className="bg-white/5 p-2 rounded border-l-2 border-primary">
                  <p className="text-[10px] text-white/60">WARNING: The city is now a "Rainbow Grit" landscape. Use your Prism Deck to scan for alchemical residues and other clues.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
              <button
                onClick={handleDismissBrief}
                className="px-4 py-2 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-primary/90 transition-colors shadow-[0_0_10px_rgba(174,62,254,0.4)]"
              >
                Initialize Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default HomeHub;
