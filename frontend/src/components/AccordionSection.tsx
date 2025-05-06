import { useEffect, useState } from 'react';

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function AccordionSection({ title, children }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  // Collapse by default on small screens
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (mediaQuery.matches) setIsOpen(false);
  }, []);

  return (
    <div className="w-full border rounded bg-white shadow">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 font-medium"
      >
        <span>{title}</span>
        <span className="text-xl">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="px-4 py-2 border-t">
          {children}
        </div>
      )}
    </div>
  );
}