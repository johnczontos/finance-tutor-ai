import EnableKnowledgeCheck from './EnableKnowledgeCheck';
import DetailLevelSlider from './DetailLevelSlider';
import EnableSourcesDisplay from './EnableSourcesDisplay';
import EnableYouTubeRecommendations from './EnableYouTubeRecommendations';
import { useEffect, useRef } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  knowledgeCheckEnabled: boolean;
  onToggleKnowledgeCheck: () => void;
  detailLevel: 'simple' | 'regular' | 'in-depth';
  onChangeDetailLevel: (level: 'simple' | 'regular' | 'in-depth') => void;
  sourcesDisplayEnabled: boolean;
  onToggleSourcesDisplay: () => void;
  youtubeRecommendationsEnabled: boolean;
  onToggleYouTubeRecommendations: () => void;
};

export default function Sidebar({
  isOpen,
  onClose,
  knowledgeCheckEnabled,
  onToggleKnowledgeCheck,
  detailLevel,
  onChangeDetailLevel,
  sourcesDisplayEnabled,
  onToggleSourcesDisplay,
  youtubeRecommendationsEnabled,
  onToggleYouTubeRecommendations
}: Props) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-bold">Menu</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-lg">
          ✕
        </button>
      </div>

      <div className="p-4 space-y-6">
        <EnableKnowledgeCheck
          enabled={knowledgeCheckEnabled}
          onToggle={onToggleKnowledgeCheck}
        />
        <EnableSourcesDisplay
          enabled={sourcesDisplayEnabled}
          onToggle={onToggleSourcesDisplay}
        />
        <EnableYouTubeRecommendations
          enabled={youtubeRecommendationsEnabled}
          onToggle={onToggleYouTubeRecommendations}
        />
        <DetailLevelSlider
          value={detailLevel}
          onChange={onChangeDetailLevel}
        />
      </div>
    </div>
  );
}
