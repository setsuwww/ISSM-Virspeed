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
    teal: { icon: "bg-teal-50 text-teal-600 border-teal-100" },
    rose: { icon: "bg-rose-50 text-rose-600 border-rose-100" },
    blue: { icon: "bg-blue-50 text-blue-600 border-blue-100" },
    yellow: { icon: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  }

  const t = tones[tone] ?? tones.slate

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={clsx("p-3 rounded-xl border", t.icon)}>
          {icon}
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-slate-500">{label}</span>
          <span className="text-3xl font-semibold text-slate-800">
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
