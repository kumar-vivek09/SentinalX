export function Toast({ message }) {
  return (
    <div className="bg-cyan-500 text-black px-3 py-2 rounded">
      {message}
    </div>
  );
}