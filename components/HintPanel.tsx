import React from 'react';

interface HintPanelProps {
  visibleHints: string[];
  canShowNext: boolean;
  onRequestHint: () => void;
}

const HintPanel: React.FC<HintPanelProps> = ({ visibleHints, canShowNext, onRequestHint }) => {
  if (visibleHints.length === 0 && !canShowNext) return null;

  return (
    <div className="mt-4 border border-primary/20 rounded-lg bg-[#0a050d]/80 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-acid uppercase tracking-widest">
          Intel ({visibleHints.length}/3)
        </span>
        {canShowNext && (
          <button
            onClick={onRequestHint}
            className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30 hover:bg-primary/30 transition-colors"
          >
            Request Intel
          </button>
        )}
      </div>
      {visibleHints.map((hint, i) => (
        <div
          key={i}
          className="flex items-start gap-2 text-xs text-gray-400 mt-2 border-l-2 border-primary/30 pl-2"
        >
          <span className="text-primary font-mono shrink-0">L{i + 1}:</span>
          <span>{hint}</span>
        </div>
      ))}
    </div>
  );
};

export default HintPanel;
