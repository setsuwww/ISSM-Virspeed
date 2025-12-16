import Image from "next/image"
import clsx from "clsx"
import { ChevronLeft } from "lucide-react"

export function Logo({ minimized, onToggle }) {
  return (
    <button onClick={onToggle} className={clsx("flex items-center gap-2 group select-none",
        minimized && "justify-center w-full"
      )}
    >
      <div className="p-1 bg-gradient-to-br from-gray-950 to-gray-700 rounded-md">
        <Image src="/icons/liveon.png"
          width={30} height={30}
          alt="Liveon icon"
          priority
        />
      </div>

      {!minimized && (
        <>
          <div className="text-xl font-bold text-yellow-500 whitespace-nowrap">
            Bee<span className="text-gray-800">fast.</span>
          </div>

          <ChevronLeft size={18} className="ml-1 text-slate-400 group-hover:text-slate-700 transition"/>
        </>
      )}
    </button>
  )
}
