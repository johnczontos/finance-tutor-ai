type Props = {
    onToggleSidebar: () => void;
  };
  
  export default function Header({ onToggleSidebar }: Props) {
    return (
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={onToggleSidebar}
          className="text-xl font-bold text-gray-700 hover:text-blue-600"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Finance Tutor AI</h1>
        <div className="w-6" /> {/* spacer for symmetrical layout */}
      </header>
    );
  }
  