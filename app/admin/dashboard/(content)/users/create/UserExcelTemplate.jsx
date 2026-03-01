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
]

export default function UserExcelTemplate() {
  return (
    <div className="py-4 bg-white rounded-lg space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-4 text-green-800">JSON Expected <span className="text-xs bg-green-100 px-2 text-green-600 rounded-full">EXAMPLE</span></h3>
          <pre className="bg-green-50 border border-green-300 text-green-800 rounded p-3 overflow-x-auto text-xs">
            {JSON.stringify(exampleRows, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
