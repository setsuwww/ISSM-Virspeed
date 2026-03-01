"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/_contexts/Toast-Provider"
import { clearHistory } from "@/_servers/admin-action/requestAction"

export function useHandleRequest({ type, initialMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState(initialMode ?? "pending")

  const toggleMode = useCallback(() => {
    const nextMode = mode === "pending" ? "history" : "pending"
    setMode(nextMode)

    const params = new URLSearchParams(searchParams.toString())
    params.set("mode", nextMode)

    router.replace(`${window.location.pathname}?${params.toString()}`)
  }, [mode, router, searchParams])

  const handleClearHistory = useCallback(() => {
    if (mode === "pending") return
    if (!confirm("Are you sure you want to clear all history for this tab?"))
      return

    startTransition(async () => {
      try {
        await clearHistory(type)
        addToast("History cleared successfully", { type: "success" })
        router.refresh()
      } catch (err) {
        addToast(err?.message || "Failed to clear history", { type: "error" })
      }
    })
  }, [mode, type, router, addToast])

  const modeClass = {
    history: "text-yellow-600 bg-yellow-100/50 border-yellow-300/50",
    pending: "text-sky-600 bg-sky-100/50 border-sky-300/50",
  }

  return {
    mode,
    isPending,
    modeClass,
    toggleMode,
    handleClearHistory,
  }
}
