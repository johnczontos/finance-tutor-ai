type DetailLevel = 'simple' | 'regular' | 'in-depth';

type Props = {
  value: DetailLevel;
  onChange: (level: DetailLevel) => void;
};

export default function DetailLevelSlider({ value, onChange }: Props) {
  const levels: DetailLevel[] = ['simple', 'regular', 'in-depth'];

  const labelMap = {
    simple: 'Novice',
    regular: 'Regular',
    'in-depth': 'Advanced',
  };

  return (
    <div className="px-4 pt-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Response Detail</label>
      <div className="flex space-x-2">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`px-2 py-0.5 text-xs rounded-full transition border ${
                value === level
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            >
            {labelMap[level]}
            </button>
        ))}
      </div>
    </div>
  );
}
