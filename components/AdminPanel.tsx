import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STAGES } from '../lib/stages';
import { useGame } from '../lib/GameContext';

interface AdminPanelProps {
  onClose: () => void;
  onReset: () => void;
  onForceUnlock: (stageId: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onReset, onForceUnlock }) => {
  const { getStageStatus, completeStage, resetStage, completedCount, totalStages } = useGame();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetIntro = () => {
    localStorage.removeItem('intro_video_played_v2');
    localStorage.removeItem('mission_brief_dismissed_v2');
    localStorage.removeItem('intro_video_played'); // Legacy cleanup
    localStorage.removeItem('mission_brief_dismissed'); // Legacy cleanup
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a050d] border border-primary/30 rounded-xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/20">
          <div>
            <h2 className="text-sm font-bold text-primary tracking-widest">ADMIN PANEL</h2>
            <p className="text-[10px] text-gray-500 font-mono">Emergency Override System</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Game State Summary */}
        <div className="px-4 pt-3 pb-2 border-b border-white/5">
          <p className="text-[10px] text-gray-500 font-mono">
            Progress: {completedCount}/{totalStages} stages complete
          </p>
        </div>

        {/* Stage Controls */}
        <div className="p-4 space-y-2">
          <p className="text-[10px] text-acid font-mono uppercase tracking-widest mb-3">Stage Override</p>
          {STAGES.map((stage) => {
            const status = getStageStatus(stage.id);
            return (
              <div key={stage.id} className="flex items-center justify-between py-1.5">
                <span className={`text-xs font-mono ${status === 'completed' ? 'text-primary' : 'text-gray-400'}`}>
                  {String(stage.id).padStart(2, '0')} {stage.title}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      navigate(`/stage-${String(stage.id).padStart(2, '0')}`);
                      onClose();
                    }}
                    className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 hover:bg-cyan-500/20"
                  >
                    GO TO
                  </button>
                  {status !== 'completed' && (
                    <button
                      onClick={() => {
                        onForceUnlock(stage.id);
                        completeStage(stage.id);
                      }}
                      className="text-[9px] bg-acid/10 text-acid px-2 py-0.5 rounded border border-acid/20 hover:bg-acid/20"
                    >
                      COMPLETE
                    </button>
                  )}
                  {status === 'completed' && (
                    <button
                      onClick={() => resetStage(stage.id)}
                      className="text-[9px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 hover:bg-orange-500/20"
                    >
                      RESET
                    </button>
                  )}
                  {status === 'locked' && (
                    <button
                      onClick={() => onForceUnlock(stage.id)}
                      className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 hover:bg-primary/20"
                    >
                      UNLOCK
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Danger Zone */}
        <div className="p-4 border-t border-red-500/20">
          {!confirmReset ? (
            <div>
              <button
                onClick={handleResetIntro}
                className="w-full py-2 mb-2 text-xs font-mono text-secondary bg-secondary/10 border border-secondary/20 rounded-lg hover:bg-secondary/20"
              >
                RESET INTRO VIDEO & BRIEF
              </button>
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20"
              >
                RESET ALL PROGRESS
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onReset();
                  onClose();
                }}
                className="flex-1 py-2 text-xs font-mono text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                CONFIRM RESET
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2 text-xs font-mono text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
              >
                CANCEL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
