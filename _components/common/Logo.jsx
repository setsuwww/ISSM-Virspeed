import Image from "next/image"
import clsx from "clsx"
import { ChevronLeft } from "lucide-react"

export function Logo({ minimized, onToggle }) {
  return (
    <button onClick={onToggle} className={clsx("flex items-center gap-2 group select-none",
      minimized && "justify-center w-full"
    )}
    >
      <Image src="/icons/liveon.png" className="rounded-lg"
        width={36} height={36}
        alt="Liveon icon"
        priority
      />

      {!minimized && (
        <>
          <div className="text-xl font-bold text-violet-500 whitespace-nowrap">
            Vir<span className="text-slate-700">speed.</span>
          </div>

          <ChevronLeft size={18} className="ml-1 text-slate-400 group-hover:text-slate-700 transition" />
        </>
      )}
    </button>
  )
}
