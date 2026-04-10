import Image from "next/image"
import clsx from "clsx"
import { ChevronLeft } from "lucide-react"

export function Logo({ minimized, onToggle }) {
  return (
    <button onClick={onToggle} className={clsx("flex items-center gap-2 group select-none",
      minimized && "justify-center w-full"
    )}
    >
      <Image
        src="/icons/lintasarta.png"
        className="rounded-lg transition-all duration-300"
        width={minimized ? 16 : 120}
        height={minimized ? 16 : 40}
        alt="Liveon icon"
        priority
      />

      {!minimized && (
        <ChevronLeft size={18} className="ml-1 text-slate-400 group-hover:text-slate-700 transition" />
      )}
    </button>
  )
}
