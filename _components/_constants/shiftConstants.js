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
