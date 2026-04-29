import { Sun, SunMoon, Moon } from "lucide-react";

export const shiftStyles = {
  MORNING: "text-yellow-600 bg-yellow-100/50 border-yellow-200/50",
  AFTERNOON: "text-orange-600 bg-orange-100/50 border-orange-200/50",
  EVENING: "text-purple-600 bg-purple-100/50 border-purple-200/50",
};

export const shiftIcons = {
  MORNING: <Sun className="w-4 h-4 text-yellow-500" />,
  AFTERNOON: <SunMoon className="w-4 h-4 text-orange-500" />,
  EVENING: <Moon className="w-4 h-4 text-purple-500" />,
};

export function PingDot({ color }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`absolute inline-flex h-full w-full rounded-full opacity-20 scale-175 ${color}`}
      ></span>
      <span
        className={`relative inline-flex rounded-full h-2 w-2 ${color}`}
      ></span>
    </span>
  )
}

export const shiftDots = {
  MORNING: (<PingDot color="bg-yellow-400" />),
  AFTERNOON: (<PingDot color="bg-orange-300" />),
  EVENING: (<PingDot color="bg-purple-300" />),
}

export const getShiftStyle = (type) => {
  switch (type?.toUpperCase()) {
    case 'MORNING': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'AFTERNOON': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'EVENING': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'OFF': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}
