"use client"

import { useState, useTransition } from "react"
import { Button } from "@/_components/ui/Button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/_context/Toast-Provider"
import { useRouter, useSearchParams } from "next/navigation"
import { clearHistory } from "@/_server/admin-action/requestAction"

export function RequestClearHistory({ type, initialMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Internal mode state
  const [mode, setMode] = useState(initialMode ?? "pending")

  // Toggle mode without touching window.location
  const toggleMode = () => {
    const nextMode = mode === "pending" ? "history" : "pending"
    setMode(nextMode)

    // Build new search params based on current
    const params = new URLSearchParams(searchParams.toString())
    params.set("mode", nextMode)

    router.replace(`${window.location.pathname}?${params.toString()}`)
  }

  const modeClass = {
    history : "text-yellow-600 bg-yellow-100/50 border-yellow-300/50",
    pending : "text-sky-600 bg-sky-100/50 border-sky-300/50",
  }

  const handleClearHistory = () => {
    if (mode === "pending") return
    if (!confirm("Are you sure you want to clear all history for this tab?")) return

    startTransition(async () => {
      try {
        await clearHistory(type)
        addToast("History cleared successfully", { type: "success" })
        router.refresh()
      } catch (err) {
        addToast(err.message || "Failed to clear history", { type: "error" })
      }
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleClearHistory}
        disabled={mode === "pending" || isPending}
        variant="outline"
        className="text-red-500 hover:text-red-700 mb-2"
      >
        <Trash2 className="w-6 h-6 mr-2" />
        {isPending ? "Clearing..." : "Clear all"}
      </Button>

      <Button onClick={toggleMode} variant="outline" className="mb-2">
        Switch Mode <span className={`px-2 rounded-lg ${modeClass[mode]}`}>{mode}</span>
      </Button>
    </div>
  )
}
