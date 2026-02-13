"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/_components/ui/Button"
import { ChevronsUpDown, PlusSquare } from "lucide-react"

export default function EmployeesTableButton() {
  const router = useRouter()
  const pathname = usePathname()

  const isShiftHours = pathname.includes("/shift-employees")
  const isWorkHours = pathname.includes("/normal-employees")

  const toggleLabel = isShiftHours ? "Shift Hours" : "Work Hours"
  const toggleRoute = isShiftHours
    ? "/admin/dashboard/users/employees/normal-employees"
    : "/admin/dashboard/users/employees/shift-employees"

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={pathname.includes("/attendances") ? "secondary" : "outline"}
        onClick={() => router.push("/admin/dashboard/users/attendances")}
      >
        Attendance
      </Button>

      <Button
        variant={isShiftHours || isWorkHours ? "secondary" : "ghost"} className="rounded-md"
        onClick={() => router.push(toggleRoute)}
      >
        {toggleLabel}
        <ChevronsUpDown size={18} strokeWidth={2} />
      </Button>

      <Button
        variant={pathname.includes("/create") ? "secondary" : "primary"}
        onClick={() => router.push("/admin/dashboard/users/create")}
      >
        <PlusSquare />
        Create Employees
      </Button>
    </div>
  )
}
