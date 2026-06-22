import React from "react";

const colorStyles = {
  cyan: {
    bar: "bg-cyan-400",
    glow: "shadow-[0_0_10px_rgba(34,211,238,0.7)]",
  },
  green: {
    bar: "bg-green-400",
    glow: "shadow-[0_0_10px_rgba(34,197,94,0.7)]",
  },
  red: {
    bar: "bg-red-400",
    glow: "shadow-[0_0_10px_rgba(248,113,113,0.7)]",
  },
  yellow: {
    bar: "bg-yellow-400",
    glow: "shadow-[0_0_10px_rgba(250,204,21,0.7)]",
  },
};

export function Progress({ title, value = 0, color = "cyan" }) {
  const selected = colorStyles[color] || colorStyles.cyan;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
      
      {/* Top Section */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm text-gray-300">{title}</h3>
        <span className="text-xs font-semibold text-gray-400">
          {value}%
        </span>
      </div>

      {/* Progress Bar Background */}
      <div className="w-full bg-gray-800/60 rounded-full h-2 overflow-hidden">
        
        {/* Progress Fill */}
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${selected.bar} ${selected.glow}`}
          style={{ width: `${value}%` }}
        />
      </div>

    </div>
  );
}