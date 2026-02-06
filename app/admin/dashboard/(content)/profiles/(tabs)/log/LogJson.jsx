// LogJSON.tsx
"use client"

export default function LogJSON({ data }) {
  return (
    <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
