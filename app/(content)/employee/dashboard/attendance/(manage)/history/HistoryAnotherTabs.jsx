"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/_components/ui/Button"
import { ButtonGroup } from "@/_components/ui/Button-group"

export default function HistoryAnotherTabs() {
  const pathname = usePathname()

  const isActive = (path) => pathname === path

  return (
    <ButtonGroup>
      <Button asChild size="sm" variant={isActive("/employee/dashboard/attendance/history") ? "primary" : "outline"}>
        <Link href="/employee/dashboard/attendance/history">Attendance</Link>
      </Button>

      <Button asChild size="sm" variant={isActive("/employee/dashboard/attendance/history/change-shift") ? "primary" : "outline"}>
        <Link href="/employee/dashboard/attendance/history/change-shift">Change Shift</Link>
      </Button>

      <Button asChild size="sm" variant={isActive("/employee/dashboard/attendance/history/leave") ? "primary" : "outline"}>
        <Link href="/employee/dashboard/attendance/history/leave">Leave</Link>
      </Button>
    </ButtonGroup>
  )
}
