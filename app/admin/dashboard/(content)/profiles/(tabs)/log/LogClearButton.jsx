"use client"

import { Button } from "@/_components/ui/Button"
import { Trash2 } from "lucide-react"

export function LogClearButton({ onClick, disabled }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className="text-red-500 hover:text-red-700 mb-2"
    >
      <Trash2 className="w-6 h-6"/>
      Clear all
    </Button>
  )
}
