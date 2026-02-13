// LogJSON.tsx
"use client"

export default function LogJSON({ data }) {
  return (
    <pre className="font-number font-semibold overflow-x-auto rounded bg-slate-200/40 p-3 text-xs text-slate-800">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
