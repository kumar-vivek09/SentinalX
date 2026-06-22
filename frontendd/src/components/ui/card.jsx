export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}