// src/components/EnableYouTubeRecommendations.tsx
type Props = {
  enabled: boolean;
  onToggle: () => void;
};

export default function EnableYouTubeRecommendations({ enabled, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">YouTube Recommendations</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
