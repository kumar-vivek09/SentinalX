export function Switch({ checked, onCheckedChange }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only"
      />
      <div className="w-10 h-5 bg-gray-600 rounded-full relative">
        <div
          className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition ${
            checked ? "translate-x-5 bg-cyan-400" : ""
          }`}
        />
      </div>
    </label>
  );
}