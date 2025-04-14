type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: Props) {
  return (
    <div
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
      <nav className="p-4 space-y-2 text-sm">
        <a href="#" className="block hover:text-blue-600">Quick Questions</a>
        <a href="#" className="block hover:text-blue-600">Study Mode</a>
        <a href="#" className="block hover:text-blue-600">Progress</a>
        <a href="#" className="block hover:text-blue-600">Settings</a>
      </nav>
    </div>
  );
}
