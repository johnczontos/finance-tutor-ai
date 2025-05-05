type Props = {
  examples: string[];
  onSelect: (query: string) => void;
};

export default function QuerySuggestions({ examples, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
        {examples.map((example, i) => (
            <button
            key={i}
            onClick={() => onSelect(example)}
            className="bg-gray-200 hover:bg-blue-200 rounded p-3 text-sm text-left overflow-hidden text-ellipsis whitespace-nowrap w-full"
            title={example} // Tooltip on hover
            >
            {example}
            </button>
        ))}
    </div>
  );
}
