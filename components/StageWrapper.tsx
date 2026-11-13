import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../lib/GameContext';
import { useHints } from '../lib/useHints';
import { getStageById } from '../lib/stages';
import { useGPSUnlock } from '../lib/useGPSUnlock';
import HintPanel from './HintPanel';
import MemoryPopup from './MemoryPopup';

interface StageWrapperProps {
  stageId: number;
  children: (props: {
    onComplete: () => void;
    isCompleted: boolean;
    showClue: boolean;
    cluePanelNode: React.ReactNode;
  }) => React.ReactNode;
  customLayout?: boolean;
  inlineClue?: boolean;
  hideBottomNav?: boolean;
}

const YEAR_PHOTOS: Record<number, { year: number; file: string; objectPosition?: string; objectFit?: 'cover' | 'contain' }> = {
  1: { year: 2012, file: '/byrds.jpeg' },
  2: { year: 2013, file: '/2013.jpg' },
  3: { year: 2014, file: '/2014.jpg' },
  4: { year: 2015, file: '/2015.png', objectFit: 'contain' },
  5: { year: 2016, file: '/2016.jpg' },
  6: { year: 2017, file: '/2017.jpg' },
  7: { year: 2018, file: '/2018.jpg' },
  8: { year: 2019, file: '/2019.jpg' },
  9: { year: 2020, file: '/2020.jpg' },
  10: { year: 2021, file: '/2021.jpeg' },
  11: { year: 2022, file: '/2022.jpg' },
  12: { year: 2023, file: '/2023.jpg' },
  13: { year: 2024, file: '/2024.jpg' },
  14: { year: 2025, file: '/2025.jpg' },
};

const StageWrapper: React.FC<StageWrapperProps> = (props) => {
  const { stageId, children, customLayout, hideBottomNav } = props;
  const navigate = useNavigate();
  const { completeStage, getStageStatus, isStageUnlocked, devMode, resetStage, newShardCount } = useGame();
  const stage = getStageById(stageId);
  const status = getStageStatus(stageId);
  const unlocked = isStageUnlocked(stageId);
  const [showClue, setShowClue] = useState(false);
  const [showMemoryPopup, setShowMemoryPopup] = useState(false);
  const [showEvidenceToast, setShowEvidenceToast] = useState(false);

  // GPS proximity check (hook must be called unconditionally)
  const gpsTarget = stage?.coordinates ?? { lat: 0, lng: 0 };
  const gpsRadius = stage?.unlockRadius ?? 50;
  const gps = useGPSUnlock(gpsTarget, gpsRadius);

  const hints = stage?.hints ?? ['', '', ''];
  const { visibleHints, canShowNext, showNextHint } = useHints(
    stageId,
    hints as [string, string, string]
  );

  if (!stage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark text-white">
        <p className="text-red-500 font-mono">Stage not found</p>
      </div>
    );
  }

  // Locked overlay
  if (!unlocked) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-background-dark text-white p-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4 block">lock</span>
          <h2 className="text-2xl font-bold text-gray-400 mb-2">STAGE {String(stageId).padStart(2, '0')} LOCKED</h2>
          <p className="text-sm text-gray-500 font-mono">Complete the previous stage to unlock.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg font-mono text-sm hover:bg-primary/30 transition-colors"
          >
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  // GPS proximity gate — only for GPS-unlocked stages that aren't completed yet
  const needsGPS = false;
  if (needsGPS) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-background-dark text-white p-6">
        <div className="text-center max-w-sm">
          <span className="material-symbols-outlined text-6xl text-primary mb-4 block animate-pulse">location_on</span>
          <h2 className="text-xl font-bold text-white mb-2">STAGE {String(stageId).padStart(2, '0')}: {stage.title}</h2>
          <p className="text-sm text-white/60 font-mono mb-1">{stage.location}</p>
          {gps.distance !== null && (
            <p className="text-lg font-bold text-primary font-mono mb-4">
              {gps.distance >= 1000 ? `${(gps.distance / 1000).toFixed(1)} km` : `${gps.distance} m`} away
            </p>
          )}
          <div className="bg-white/5 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-xs text-white/50 font-mono">Travel within <span className="text-acid font-bold">{gpsRadius}m</span> of the location to unlock this stage.</p>
          </div>
          {gps.error && (
            <p className="text-xs text-red-400 font-mono mb-4">{gps.error}</p>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg font-mono text-sm hover:bg-primary/30 transition-colors"
          >
            Return to Hub
          </button>
        </div>
      </div>
    );
  }


  const handleComplete = () => {
    completeStage(stageId);
    setShowEvidenceToast(true);
    setTimeout(() => setShowEvidenceToast(false), 3000);

    const yearData = YEAR_PHOTOS[stageId];
    if (yearData) {
      setShowMemoryPopup(true);
    } else {
      setShowClue(true);
    }
  };

  const handleMemoryDismiss = () => {
    setShowMemoryPopup(false);
    setShowClue(true);
  };

  const isCompleted = status === 'completed';

  const cluePanel = (showClue || isCompleted) ? (
    <div className="mt-6 mx-4 border border-acid/30 rounded-lg bg-acid/5 p-4 animate-pulse">
      <p className="text-[10px] font-mono text-acid uppercase tracking-widest mb-2">
        Next Clue Decoded
      </p>
      <p className="text-sm text-acid/80 font-mono leading-relaxed">{stage.clueText}</p>
      {stageId < 15 && (
        <button
          onClick={() => navigate(`/stage-${String(stageId + 1).padStart(2, '0')}`)}
          className="mt-4 w-full py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg text-sm tracking-wider hover:shadow-[0_0_20px_rgba(174,62,254,0.5)] transition-shadow"
        >
          PROCEED TO STAGE {String(stageId + 1).padStart(2, '0')}
        </button>
      )}
      {stageId === 15 && (
        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg text-sm tracking-wider hover:shadow-[0_0_20px_rgba(174,62,254,0.5)] transition-shadow"
        >
          RETURN TO HUB
        </button>
      )}
    </div>
  ) : null;

  const hintPanel = (!isCompleted && !showClue) ? (
    <div className="mx-4 mb-4">
      <HintPanel
        visibleHints={visibleHints}
        canShowNext={canShowNext}
        onRequestHint={showNextHint}
      />
    </div>
  ) : null;

  const devToolbar = devMode ? (
    <div className="fixed bottom-16 right-4 z-[100] flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-acid/30 rounded-lg px-3 py-2">
      <span className="text-[9px] font-mono text-acid/60">S{String(stageId).padStart(2, '0')}</span>
      <button
        onClick={() => resetStage(stageId)}
        className="text-[9px] font-mono bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 hover:bg-orange-500/30"
      >
        RESET
      </button>
      <button
        onClick={handleComplete}
        className="text-[9px] font-mono bg-acid/20 text-acid px-2 py-0.5 rounded border border-acid/30 hover:bg-acid/30"
      >
        COMPLETE
      </button>
    </div>
  ) : null;

  const bottomNav = !hideBottomNav && !showMemoryPopup ? (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a050d]/90 backdrop-blur-xl border-t border-white/10 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 p-2">
          <span className="material-symbols-outlined text-white/40 text-xl">home</span>
          <span className="text-[9px] font-bold tracking-wider text-white/40">HUB</span>
        </button>
        <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-1 p-2">
          <span className="material-symbols-outlined text-white/40 text-xl">map</span>
          <span className="text-[9px] font-bold tracking-wider text-white/40">MAP</span>
        </button>
        <button onClick={() => navigate('/items')} className="flex flex-col items-center gap-1 p-2">
          <span className="material-symbols-outlined text-white/40 text-xl">inventory_2</span>
          <span className="text-[9px] font-bold tracking-wider text-white/40">ITEMS</span>
        </button>
        <button onClick={() => navigate('/shards')} className="flex flex-col items-center gap-1 p-2 relative">
          <span className="material-symbols-outlined text-white/40 text-xl">diamond</span>
          <span className="text-[9px] font-bold tracking-wider text-white/40">CRYSTALS</span>
          {newShardCount > 0 && (
            <span className="absolute top-1 right-0 size-3 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#f53fe8]" />
          )}
        </button>
      </div>
    </div>
  ) : null;

  const yearData = YEAR_PHOTOS[stageId];
  const memoryPopup = showMemoryPopup && yearData ? (
    <MemoryPopup
      year={yearData.year}
      photoFile={yearData.file}
      objectPosition={yearData.objectPosition}
      objectFit={yearData.objectFit}
      onDismiss={handleMemoryDismiss}
    />
  ) : null;

  const evidenceToast = showEvidenceToast ? (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-black/90 border border-acid/50 px-6 py-3 rounded-full shadow-[0_0_15px_rgba(204,255,0,0.3)] animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-3">
      <span className="material-symbols-outlined text-acid animate-pulse">fingerprint</span>
      <div className="flex flex-col">
        <span className="text-acid text-xs font-bold tracking-widest uppercase">MEMORY UNLOCKED</span>
        <span className="text-white/50 text-[10px] font-mono">Evidence Recovered — Check Archives</span>
      </div>
    </div>
  ) : null;

  // Custom layout mode
  if (customLayout) {
    return (
      <>
        {children({
          onComplete: handleComplete,
          isCompleted: isCompleted || showClue,
          showClue,
          cluePanelNode: cluePanel
        })}
        {/* Only show overlay if NOT inlineClue */}
        {!props.inlineClue && (showClue || isCompleted) && cluePanel && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            {cluePanel}
          </div>
        )}
        {hintPanel && (
          <div className="pb-24">
            {hintPanel}
          </div>
        )}
        {memoryPopup}
        {evidenceToast}
        {bottomNav}
        {devToolbar}
      </>
    );
  }

  // Default layout mode
  return (
    <div className="relative flex flex-col min-h-screen bg-background-dark text-white pb-safe-nav">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-3 bg-[#030303]/90 backdrop-blur-md border-b border-primary/20 px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-white text-lg">arrow_back</span>
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-mono text-acid uppercase tracking-widest">
            Stage {String(stageId).padStart(2, '0')}
          </p>
          <h1 className="text-sm font-bold text-white tracking-tight">{stage.title}</h1>
        </div>
        {isCompleted && (
          <span className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-1 rounded border border-primary/20">
            COMPLETE
          </span>
        )}
      </header>

      {/* Stage Content */}
      <main className="flex-1 p-4 overflow-y-auto pb-24">
        {children({ onComplete: handleComplete, isCompleted: isCompleted || showClue, showClue, cluePanelNode: cluePanel })}

        {/* Clue reveal */}
        {(showClue || isCompleted) && (
          <div className="mt-6 border border-acid/30 rounded-lg bg-acid/5 p-4 animate-pulse">
            <p className="text-[10px] font-mono text-acid uppercase tracking-widest mb-2">
              Next Clue Decoded
            </p>
            <p className="text-sm text-acid/80 font-mono leading-relaxed">{stage.clueText}</p>
            {stageId < 15 && (
              <button
                onClick={() => navigate(`/stage-${String(stageId + 1).padStart(2, '0')}`)}
                className="mt-4 w-full py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg text-sm tracking-wider hover:shadow-[0_0_20px_rgba(174,62,254,0.5)] transition-shadow"
              >
                PROCEED TO STAGE {String(stageId + 1).padStart(2, '0')}
              </button>
            )}
            {stageId === 15 && (
              <button
                onClick={() => navigate('/')}
                className="mt-4 w-full py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg text-sm tracking-wider hover:shadow-[0_0_20px_rgba(174,62,254,0.5)] transition-shadow"
              >
                RETURN TO HUB
              </button>
            )}
          </div>
        )}

        {/* Hint Panel */}
        {!isCompleted && !showClue && (
          <HintPanel
            visibleHints={visibleHints}
            canShowNext={canShowNext}
            onRequestHint={showNextHint}
          />
        )}
      </main>
      {memoryPopup}
      {evidenceToast}
      {bottomNav}
      {devToolbar}
    </div>
  );
};

export default StageWrapper;
