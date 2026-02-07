"use client"

import { useState } from "react"
import { wordsLimit } from "@/_function/globalFunction"

export function LogUserAgent({ value }) {
  const [open, setOpen] = useState(false)

  if (!value) {
    return <span className="text-slate-400">-</span>
  }

  return (
    <div
      onClick={() => setOpen(!open)}
      className="max-w-[260px] cursor-pointer text-sm text-slate-600"
    >
      <span className={open ? "whitespace-normal" : "truncate block"}>
        {open ? value : wordsLimit(value, 5)}
      </span>

      {!open && (
        <span className=" text-xs text-blue-500">
          more
        </span>
      )}
    </div>
  )
}
