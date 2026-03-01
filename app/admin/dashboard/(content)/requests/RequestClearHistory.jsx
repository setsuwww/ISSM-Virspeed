"use client"

import { Button } from "@/_components/ui/Button"
import { Trash2 } from "lucide-react"
import { capitalize } from "@/_functions/globalFunction"

import { useHandleRequest } from "@/_clients/handlers/admin/useHandleRequest"

export function RequestClearHistory({ type, initialMode }) {
  const {
    mode,
    isPending,
    modeClass,
    toggleMode,
    handleClearHistory,
  } = useHandleRequest({ type, initialMode })

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleClearHistory}
        disabled={mode === "pending" || isPending}
        variant="outline"
        className="text-red-500 hover:text-red-700 mb-2"
      >
        <Trash2 className="w-6 h-6" />
        {isPending ? "Clearing..." : "Clear all"}
      </Button>

      <Button
        onClick={toggleMode}
        variant="outline"
        className="mb-2"
      >
        Mode :{" "}
        <span className={`px-1.5 ${modeClass[mode]}`}>
          {capitalize(mode)}
        </span>
      </Button>
    </div>
  )
}
