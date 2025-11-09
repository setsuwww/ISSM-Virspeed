"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarClock, MoreHorizontal, Pen, Trash } from "lucide-react"
import { format } from "date-fns"

import { Checkbox } from "@/_components/ui/Checkbox"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/_components/ui/Card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/_components/ui/Dropdown-menu"

import SchedulesActionHeader from "./SchedulesActionHeader"
import ScheduleUsersDialog from "./SchedulesUsersDialog"
import { useHandleSchedules } from "@/_function/handlers/useHandleSchedules"
import { capitalize } from "@/_function/globalFunction"
import { frequencyStyles } from "@/_constants/scheduleConstants"
import EmptyStates from "@/_components/content/EmptyStates"
import { useSchedulesHooks } from "@/_function/hooks/useSchedulesHooks"

export default function SchedulesCard({ data }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState([])

  const {
    search, setSearch,
    filterFrequency, setFilterFrequency,
    filteredData,
  } = useSchedulesHooks(data)

  const {
    toggleSelect, deleteSelected, deleteAll,
    handleEditSchedule, handleDeleteSchedule,
    onExportPDF,
  } = useHandleSchedules(selectedIds, setSelectedIds, filteredData, () => router.refresh())

  return (
    <div className="space-y-4">
      <SchedulesActionHeader
        search={search} setSearch={setSearch}
        filterFrequency={filterFrequency} onFilterFrequencyChange={setFilterFrequency}
        selectedCount={selectedIds.length} totalCount={filteredData.length}
        onDeleteSelected={deleteSelected} onDeleteAll={deleteAll}
        onExportPDF={() => onExportPDF(filteredData)}
      />

      {filteredData.length === 0 ? (
        <EmptyStates />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredData.map((schedule) => {
            const formatedCreatedDate = format(new Date(schedule.createdAt), "dd-MMMM-yyyy")
            const formatedUpdatedDate = format(new Date(schedule.updatedAt), "dd-MMMM-yyyy")

            return (
              <Card key={schedule.id} className="relative group">
                <CardHeader className="flex flex-row items-center justify-between px-6 py-3">
                  <CardTitle>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${frequencyStyles[capitalize(schedule.frequency)]}`}>
                        <CalendarClock strokeWidth={1.5} size={20} />
                      </div>
                      <div className="flex font-semibold text-slate-600">
                        <h2 className="leading-snug">{schedule.title}</h2>
                      </div>
                    </div>
                  </CardTitle>

                  <div className="flex items-center gap-2">
                    <Checkbox checked={selectedIds.includes(schedule.id)}
                      className="border-slate-300"
                      onCheckedChange={(checked) => toggleSelect(schedule.id, checked === true)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-md bg-slate-50 hover:bg-slate-100">
                          <MoreHorizontal className="w-5 h-5 text-slate-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-28">
                        <DropdownMenuItem onClick={() => handleEditSchedule(schedule.id)}>
                          <Pen size={10}/> <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteSchedule(schedule.id)} className="hover:text-rose-600">
                          <Trash size={10}/> <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm font-semibold text-slate-600">Assigned Users:</p>
                  <ScheduleUsersDialog users={schedule.users} schedules={schedule} />
                </CardContent>

                <CardFooter className="flex justify-between items-center text-xs text-slate-500">
                  <div>
                    <div className="font-semibold text-slate-600">{formatedCreatedDate}</div>
                    <div className="text-slate-400">{formatedUpdatedDate}</div>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
