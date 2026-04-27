"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { format } from "date-fns";

import { Checkbox } from "@/_components/ui/Checkbox";

import SchedulesActionHeader from "./SchedulesActionHeader";
import ScheduleUsersDialog from "./SchedulesUsersDialog";
import { useHandleSchedules } from "@/_clients/handlers/admin/useHandleSchedules";
import { frequencyStyles } from "@/_components/_constants/theme/scheduleTheme";
import EmptyStates from "@/_components/common/EmptyStates";
import { useSchedulesHooks } from "@/_clients/hooks/admin/useSchedulesHooks";

export default function SchedulesCard({ data }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    search, setSearch,
    filterFrequency, setFilterFrequency,
    filteredData,
  } = useSchedulesHooks(data);

  const {
    toggleSelect,
    deleteSelected,
    deleteAll,
    handleEditSchedule,
    handleDeleteSchedule,
  } = useHandleSchedules({
    selectedIds, setSelectedIds,
    filteredData,
  });

  return (
    <div className="space-y-4">
      <SchedulesActionHeader
        search={search} setSearch={setSearch}
        filterFrequency={filterFrequency} onFilterFrequencyChange={setFilterFrequency} filteredData={filteredData}
        selectedCount={selectedIds.length} totalCount={filteredData.length}
        onDeleteSelected={deleteSelected} onDeleteAll={deleteAll}
      />

      {filteredData.length === 0 ? (
        <EmptyStates />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredData.map((schedule) => {
            const formatedStartDate = format(new Date(schedule.startDate), "dd MMMM yyyy");

            return (
              <div key={schedule.id}
                className="rounded-lg ring-1 ring-slate-200 border-b-2 border-slate-200 bg-white shadow-sm transition-all flex flex-col"
              >
                <div className="flex flex-row items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${frequencyStyles[schedule.frequency]}`}>
                      <CalendarClock strokeWidth={1.5} size={20} />
                    </div>

                    <div className="flex flex-col">
                      <h2 className="text-sm font-medium text-slate-700">{schedule.title}</h2>
                      <h4 className="text-xs font-light text-slate-400">{formatedStartDate}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.includes(schedule.id)} className="border-slate-300"
                      onCheckedChange={(checked) => toggleSelect(schedule.id, checked === true)}
                    />
                  </div>
                </div>

                <div className="pt-2 pb-6 px-4 space-y-2">
                  <p className="text-xs text-slate-400">
                    {schedule.description}
                  </p>

                  <ScheduleUsersDialog users={schedule.users} schedules={schedule} />
                </div>

                <div className="flex space-x-2 items-center text-xs text-slate-500 px-4 py-3 border-t">
                  <button className="hover:text-slate-600" onClick={() => handleEditSchedule(schedule.id)}>Edit</button>
                  <button className="text-red-400 hover:text-red-600" onClick={() => handleDeleteSchedule(schedule.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
