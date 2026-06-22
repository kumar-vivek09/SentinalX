export function Badge({ children }) {
  return (
    <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-md">
      {children}
    </span>
  );
}