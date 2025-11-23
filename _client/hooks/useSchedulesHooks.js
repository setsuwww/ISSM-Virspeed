"use client"

import { useState, useMemo, useCallback } from "react"

export function useSchedulesHooks(data = []) {
  const [search, setSearch] = useState("")
  const [filterFrequency, setFilterFrequency] = useState("all")

  const filteredData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : []

    return safeData
      .filter((s) => {
        const title = s?.title?.toLowerCase() || ""
        const desc = s?.description?.toLowerCase() || ""
        return (
          title.includes(search.toLowerCase()) ||
          desc.includes(search.toLowerCase())
        )
      })
      .filter((s) => {
        if (filterFrequency === "all") return true
        return s.frequency === filterFrequency
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate).getTime()
        const dateB = new Date(b.startDate).getTime()
        return dateB - dateA
      })
  }, [data, search, filterFrequency])

  const onSearchChange = useCallback((value) => setSearch(value), [])
  const onFilterFrequencyChange = useCallback((value) => setFilterFrequency(value), [])

  return {
    search, filterFrequency, filteredData,
    setSearch: onSearchChange, setFilterFrequency: onFilterFrequencyChange,
  }
}
