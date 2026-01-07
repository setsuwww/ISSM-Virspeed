"use client"

import { SearchX } from "lucide-react"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="flex items-center space-x-2">
        <SearchX className="w-20 h-20 text-yellow-500" />
        <h1 className="text-6xl font-bold text-slate-700">404!</h1>
      </div>
      <p className="mt-4 text-slate-600 text-center max-w-md">
        The page you are looking for does not exist or has been moved, or maybe you are looking for it incorrectly
      </p>

      <Link
        href="/auth/login"
        className="mt-6 inline-flex items-center text-blue-500 hover:text-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
