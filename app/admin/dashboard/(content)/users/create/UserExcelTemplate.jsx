"use client"

import React from "react"

const exampleRows = [
  {
    name: "Albert",
    email: "albert@example.com",
    password: "albert123",
    role: "EMPLOYEE",
    division: "IT Support",
    workMode: "WORK_HOURS",
    shift: null,
  },
  {
    name: "Charlie",
    email: "charlie@example.com",
    password: "charlie123",
    role: "EMPLOYEE",
    division: "IT Support",
    workMode: "WORK_HOURS",
    shift: null,
  },
  {
    name: "Emily",
    email: "emily@example.com",
    password: "emily123",
    role: "EMPLOYEE",
    division: "IT Support",
    workMode: "WORK_HOURS",
    shift: null,
  },
  {
    name: "Bruce",
    email: "bruce@example.com",
    password: "bruce321",
    role: "USER",
    division: "Finance",
    workMode: "SHIFT",
    shift: "MORNING",
  },
  {
    name: "Dirman",
    email: "dirman@example.com",
    password: "dirman321",
    role: "USER",
    division: "Finance",
    workMode: "SHIFT",
    shift: "AFTERNOON",
  },
  {
    name: "Frank",
    email: "frank@example.com",
    password: "frank123",
    role: "USER",
    division: "Finance",
    workMode: "SHIFT",
    shift: "EVENING",
  },
]

export default function UserExcelTemplate() {
  return (
    <div className="py-4     bg-white rounded-lg space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-4">Excel example <span className="text-xs bg-yellow-100 px-2 text-yellow-600 rounded-full">EXAMPLE</span></h3>
          <table className="table-auto border-collapse border border-slate-300 w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="border px-2 py-1 text-left capitalize">name</th>
                <th className="border px-2 py-1 text-left capitalize">email</th>
                <th className="border px-2 py-1 text-left capitalize">password</th>
                <th className="border px-2 py-1 text-left capitalize">role</th>
                <th className="border px-2 py-1 text-left capitalize">division</th>
                <th className="border px-2 py-1 text-left capitalize">work-mode</th>
                <th className="border px-2 py-1 text-left capitalize">shift</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              {exampleRows.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.name}</td>
                  <td className="border px-2 py-1">{row.email}</td>
                  <td className="border px-2 py-1">{row.password}</td>
                  <td className="border px-2 py-1">{row.role}</td>
                  <td className="border px-2 py-1">{row.division ?? "null"}</td>
                  <td className="border px-2 py-1">{row.workMode}</td>
                  <td className="border px-2 py-1">{row.shift ?? "null"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-medium mb-4">JSON Expected <span className="text-xs bg-yellow-100 px-2 text-yellow-600 rounded-full">EXAMPLE</span></h3>
          <pre className="bg-green-50 border border-green-300 text-green-800 rounded p-3 overflow-x-auto text-xs">
            {JSON.stringify([exampleRows[0]], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
