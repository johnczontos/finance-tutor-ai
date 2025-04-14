export default function Sidebar() {
    return (
      <div className="w-64 bg-gray-100 border-r p-6">
        <h2 className="text-xl font-bold mb-4">Navigation</h2>
        <p className="text-sm font-medium mb-2">AI Help Mode:</p>
        <ul className="space-y-2">
          {["Quick Question", "In Depth Explanation", "Create a Study Guide", "Study Mode"].map((mode, i) => (
            <li key={mode}>
              <label className="flex items-center gap-2">
                <input type="radio" name="mode" defaultChecked={i === 0} />
                <span>{mode}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  