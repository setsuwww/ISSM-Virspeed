/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./_components/**/*.{js,jsx,ts,tsx}",
    "./_constants/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // Text
    "text-yellow-50", "text-yellow-100", "text-yellow-200", "text-yellow-300", "text-yellow-400",
    "text-yellow-500", "text-yellow-600", "text-yellow-700", "text-yellow-800", "text-yellow-900", "text-yellow-950",

    // Background
    "bg-yellow-50", "bg-yellow-100", "bg-yellow-200", "bg-yellow-300", "bg-yellow-400",
    "bg-yellow-500", "bg-yellow-600", "bg-yellow-700", "bg-yellow-800", "bg-yellow-900", "bg-yellow-950",

    // Background with opacity
    "bg-yellow-50/50", "bg-yellow-100/50", "bg-yellow-200/50", "bg-yellow-300/50", "bg-yellow-400/50",
    "bg-yellow-500/50", "bg-yellow-600/50", "bg-yellow-700/50", "bg-yellow-800/50", "bg-yellow-900/50", "bg-yellow-950/50",

    // Border
    "border-yellow-50", "border-yellow-100", "border-yellow-200", "border-yellow-300", "border-yellow-400",
    "border-yellow-500", "border-yellow-600", "border-yellow-700", "border-yellow-800", "border-yellow-900", "border-yellow-950",

    // Border with opacity
    "border-yellow-50/50", "border-yellow-100/50", "border-yellow-200/50", "border-yellow-300/50", "border-yellow-400/50",
    "border-yellow-500/50", "border-yellow-600/50", "border-yellow-700/50", "border-yellow-800/50", "border-yellow-900/50", "border-yellow-950/50",

    // Gradient
    "from-yellow-50", "from-yellow-100", "from-yellow-200", "from-yellow-300", "from-yellow-400",
    "from-yellow-500", "from-yellow-600", "from-yellow-700", "from-yellow-800", "from-yellow-900", "from-yellow-950",
    "to-yellow-50", "to-yellow-100", "to-yellow-200", "to-yellow-300", "to-yellow-400",
    "to-yellow-500", "to-yellow-600", "to-yellow-700", "to-yellow-800", "to-yellow-900", "to-yellow-950",
    {
      pattern: /(from|to)-yellow-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
  ],
  theme: {
    extend: {},
  },
};

export default config;
