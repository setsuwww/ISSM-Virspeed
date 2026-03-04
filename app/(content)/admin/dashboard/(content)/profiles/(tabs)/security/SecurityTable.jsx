"use client"

import { useState } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/_components/ui/Table"
import { actionColor } from "@/_constants/theme/actionColor"
import { SecurityRowAction } from "./SecurityRowAction"
import { LogUserAgent } from "../log/LogUserAgent"

export function SecurityTable({ logs: initialLogs }) {
  const [logs, setLogs] = useState(initialLogs)

  const handleUserUpdate = (userId, updates) => {
    setLogs(prevLogs =>
      prevLogs.map(log =>
        log.user?.id === userId
          ? { ...log, user: { ...log.user, ...updates } }
          : log
      )
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>User</TableHead>
          <TableHead>User Action</TableHead>
          <TableHead>IP</TableHead>
          <TableHead>User Agent</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {logs.map(log => (
          <TableRow key={log.id}>
            <TableCell>
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-slate-600">
                  {log.date}
                </span>
                <span className="text-xs text-slate-400">
                  {log.time}
                </span>
              </div>
            </TableCell>

            <TableCell>
              {log.user ? (
                <div className="flex flex-col">
                  <span className="font-medium text-slate-600">
                    {log.user.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {log.user.email}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-600">
                    {log.user.role}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 italic">Unknown</span>
              )}
            </TableCell>

            <TableCell>
              <span
                className={`border border-slate-300/80 shadow-2xs px-2 py-1 rounded-md text-xs font-semibold ${actionColor(
                  log.action
                )}`}
              >
                {log.action.replace("_", " ")}
              </span>
            </TableCell>

            <TableCell>
              {log.ip ?? <span className="text-slate-400">-</span>}
            </TableCell>

            <TableCell className="max-w-[260px] truncate">
              <LogUserAgent value={log.userAgent} />
            </TableCell>

            <TableCell>
              <SecurityRowAction log={log} onUserUpdate={handleUserUpdate} />
            </TableCell>
          </TableRow>
        ))}

        {logs.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-slate-400">
              No security logs found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
