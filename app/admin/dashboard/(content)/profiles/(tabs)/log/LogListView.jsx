// AdminLogList.tsx
"use client"

import LogJSON from "./LogJson"

export default function AdminLogList({ logs }) {
  if (!logs.length) {
    return <p className="text-sm text-gray-500">No activity logs</p>
  }

  return (
    <div className="space-y-3">
      {logs.map(log => (
        <div
          key={log.id}
          className="rounded-md border bg-white p-4"
        >
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Row label="Route" value={log.url} />
            <Row
              label="User"
              value={`${log.user.name} (${log.user.email})`}
            />
            <Row label="Action" value={log.action} />
            <Row
              label="Time"
              value={new Date(log.createdAt).toLocaleString()}
            />
          </div>

          {log.data && (
            <div className="mt-3">
              <p className="mb-1 text-xs text-gray-500">Data</p>
              <LogJSON data={log.data} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
