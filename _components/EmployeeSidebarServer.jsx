import Image from "next/image"
import EmployeeSidebarLink from "./EmployeeSidebarLink"

export default async function EmployeeSidebarServer({ scheduleCount }) {
  return (
    <aside className="w-64 h-screen bg-white text-sm flex flex-col border-r border-slate-200">
      <div className="text-2xl font-bold px-7 text-sky-800 py-6.5 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Image src="/icons/liveon.png" width={20} height={20} alt="Liveon icon" />
          <div className="text-xl font-bold text-sky-800">Liveon.</div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

        <EmployeeSidebarLink href="/employee/dashboard/attendance/checkin" icon="QrCode">
          Attendances
        </EmployeeSidebarLink>

        <EmployeeSidebarLink href="/employee/dashboard/attendance/history" icon="Clock">
          History
        </EmployeeSidebarLink>

        <EmployeeSidebarLink href="/employee/dashboard/attendance/change-shift" icon="RefreshCcw">
          Change Shift
        </EmployeeSidebarLink>

        <EmployeeSidebarLink
          href="/employee/dashboard/my-schedule"
          icon="Calendar"
          badge={scheduleCount}
        >
          Your Schedule
        </EmployeeSidebarLink>

        <EmployeeSidebarLink href="/employee/dashboard/profile" icon="User">
          Profile
        </EmployeeSidebarLink>

      </nav>
    </aside>
  )
}

