"use client"

import { METHOD_COLORS } from "@/_constants/static/methodColors"
import LogJSON from "./LogJson"

export default function LogListView({ logs }) {
  if (!logs.length) {
    return <p className="text-sm text-gray-500">No activity logs</p>
  }

  return (
    <div className="space-y-4">
      {logs.map(log => {
        const method = log.method || "POST"
        const badgeColor =
          METHOD_COLORS[method] ||
          "bg-gray-100 text-gray-600 border-gray-300"

        return (
          <div
            key={log.id}
            className="rounded-md border bg-white px-4 py-3"
          >
            {/* HEADER */}
            <div className="flex items-center gap-3">
              <span
                className={`min-w-[54px] text-center rounded border px-2 py-0.5 text-xs font-semibold ${badgeColor}`}
              >
                {method}
              </span>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">
                  {log.url}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* META */}
            <div className="mt-3 text-sm">
              <MetaRow
                label="User"
                value={`${log.user.name} (${log.user.email})`}
              />
              <MetaRow
                label="Action"
                value={log.action}
              />
            </div>

            {/* PAYLOAD */}
            {log.data && (
              <div className="mt-4">
                <div className="mb-1.5 text-xs font-medium text-gray-500">
                  PAYLOAD
                </div>
                <div className="rounded bg-green-50 border border-green-100 p-2">
                  <LogJSON data={log.data} />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MetaRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="w-16 text-sm uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-sm text-gray-800">
        {value}
      </span>
    </div>
  )
}
