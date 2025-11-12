"use client";

import React, { useState } from "react";

export default function MacTerminalDummy() {
  const [input, setInput] = useState("");
  const [dark, setDark] = useState(true);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim() !== "") {
        setLines([...lines, `> ${input}`]);
      }
      setInput("");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        dark ? "bg-slate-900" : "bg-gray-100"
      } p-6`}
    >
      <div
        className={`w-full max-w-3xl rounded-xl shadow-2xl border ${
          dark ? "bg-black text-green-400 border-slate-700" : "bg-white text-gray-800 border-gray-300"
        } font-mono overflow-hidden`}
      >
        {/* Title bar */}
        <div
          className={`flex items-center gap-2 px-4 py-2 border-b ${
            dark ? "border-slate-700 bg-slate-800/70" : "bg-gray-100"
          }`}
        >
          <div className="flex gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500" />
            <span className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
            <span className="w-3.5 h-3.5 rounded-full bg-green-500" />
          </div>
          <span className="ml-3 text-sm opacity-70 select-none">Command Prompt</span>
        </div>

        {/* Terminal content */}
        <div className="p-4 h-[400px] overflow-y-auto">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`bg-transparent flex-1 outline-none ${
                dark ? "text-green-400" : "text-gray-800"
              }`}
              placeholder="type something and press Enter..."
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
}
