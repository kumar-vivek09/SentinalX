export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white px-4 py-2 rounded-xl shadow-lg transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}