"use client"

import { useSearchParams } from "next/navigation"
import { RequestClearHistory } from "./RequestClearHistory"

export function RequestWrapper({ type }) {
  const searchParams = useSearchParams()
  const mode = (searchParams?.get("mode"))

  return <RequestClearHistory type={type} initialMode={mode} />
}
