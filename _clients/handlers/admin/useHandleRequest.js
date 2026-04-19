"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { clearHistory } from "@/_servers/admin-action/request_action"
import { useActionHelper } from "@/_stores/common/useActionStore"
import { useToast } from "@/_contexts/Toast-Provider"

export function useHandleRequest({ type, initialMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const { withTry, withConfirm } = useActionHelper()

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
    if (mode === "pending") {
      toast.error("Cannot clear pending requests.")
      return
    }

    startTransition(async () => {
      await withConfirm("Are you sure you want to clear all history for this tab?",
        async () => {
          await withTry(
            () => clearHistory(type),
            "History cleared successfully.",
            "Failed to clear history."
          )

          router.refresh()
        }
      )
    })
  }, [mode, type, router, withConfirm, withTry, toast])

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
