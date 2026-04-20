"use client"

import { Card, CardContent } from "@/_components/ui/Card"
import clsx from "clsx"

export function MainStats({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <StatItem key={item.label} {...item} />
      ))}
    </div>
  )
}

function StatItem({ icon, label, value, tone = "slate" }) {
  const tones = {
    teal: { icon: "bg-emerald-400 text-emerald-50 border-emerald-600", text: "text-emerald-900" },
    rose: { icon: "bg-red-400 text-red-50 border-red-600", text: "text-red-900" },
    blue: { icon: "bg-blue-400 text-blue-50 border-blue-600", text: "text-blue-900" },
    yellow: { icon: "bg-yellow-400 text-yellow-50 border-yellow-600", text: "text-yellow-900" },
  }

  const t = tones[tone] ?? tones.slate

  return (
    <Card className="border-b-2 border-slate-300 shadow-xs">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={clsx("p-3 rounded-2xl border", t.icon)}>
          {icon}
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-slate-500">{label}</span>
          <span className={clsx("text-2xl font-semibold", t.text)}>
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
