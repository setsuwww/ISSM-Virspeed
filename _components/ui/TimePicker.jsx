"use client";
import * as React from "react"
import { Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"

export function TimePicker({
  value,
  onChange,
  id
}) {
  const [hour, setHour] = React.useState("00")
  const [minute, setMinute] = React.useState("00")

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      setHour(h)
      setMinute(m)
    }
  }, [value])

  const handleChange = (h, m) => {
    const formatted = `${h}:${m}`
    onChange?.(formatted)
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-slate-600" />
      <Select
        value={hour}
        onValueChange={(h) => {
          setHour(h)
          handleChange(h, minute)
        }}
      >
        <SelectTrigger id={id ? `${id}-hour` : undefined} className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 24 }).map((_, i) => {
            const h = i.toString().padStart(2, "0")
            return (
              <SelectItem key={i} value={h}>
                {h}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <span className="text-slate-500">:</span>

      <Select
        value={minute}
        onValueChange={(m) => {
          setMinute(m)
          handleChange(hour, m)
        }}
      >
        <SelectTrigger id={id ? `${id}-minute` : undefined} className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }).map((_, i) => {
            const m = i.toString().padStart(2, "0")
            return (
              <SelectItem key={i} value={m}>
                {m}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
