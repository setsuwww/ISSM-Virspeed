"use client"

import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/_components/ui/Card"
import { useShiftCalendarHooks, useShiftSelection, useBulkPreset } from "@/_clients/hooks/admin/useShiftCalendarHooks"

// Modular Components
import CalendarHeader from "./CalendarHeader"
import CalendarGrid from "./CalendarGrid"
import CalendarSingleCreateModal from "./CalendarSingleCreateModal"
import CalendarBulkCreateModal from "./CalendarBulkCreateModal"
import CalendarSmartAssign from "./CalendarSmartAssign"

export default function ShiftCalendar({ user, assignments = [], shifts = [], selectedMonth }) {
  const mainHooks = useShiftCalendarHooks({ user, assignments, shifts, selectedMonth })
  const selectionHooks = useShiftSelection(user?.id)
  const presetHooks = useBulkPreset(user?.id)

  const {
    isPending, loadingAction,
    availableShifts, hasAvailableShifts,
    singleModalOpen, setSingleModalOpen,
    selectedDate, existingAssignment,
    formShiftId, setFormShiftId,
    bulkModalOpen, setBulkModalOpen,
    bulkStartDate, setBulkStartDate,
    bulkEndDate, setBulkEndDate,
    bulkPattern, setBulkPattern,
    currentDate, daysInMonth, emptyDays,
    handlePrevMonth, handleNextMonth,
    openSingleModal,
    handleSaveSingle, handleDeleteSingle, handleSaveBulk, handleDeleteAll
  } = mainHooks

  const {
    isSelectMode, selectedDates, toggleSelectMode, toggleDateSelection, selectAll, handleBulkDelete, loading: selectionLoading
  } = selectionHooks

  const {
    presetMode, setPresetMode, presetShiftId, setPresetShiftId, handleApplyPreset, loading: presetLoading
  } = presetHooks

  const handleDayClick = (day) => {
    if (isSelectMode) {
      toggleDateSelection(day)
    } else {
      openSingleModal(day)
    }
  }

  const isLoading = isPending || loadingAction || selectionLoading || presetLoading

  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      <Card className="shadow-sm rounded-xl border-slate-200 overflow-hidden mb-6 bg-white !p-0">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onBulkAssign={() => setBulkModalOpen(true)}
          isSelectMode={isSelectMode}
          toggleSelectMode={toggleSelectMode}
          selectedCount={selectedDates.length}
          onBulkDelete={handleBulkDelete}
          onDeleteAll={handleDeleteAll}
          onSelectAll={() => selectAll(daysInMonth)}
        />

        <CalendarSmartAssign
          presetMode={presetMode}
          setPresetMode={setPresetMode}
          presetShiftId={presetShiftId}
          setPresetShiftId={setPresetShiftId}
          availableShifts={availableShifts}
          onApply={() => handleApplyPreset(currentDate)}
          loading={presetLoading}
        />

        <CardContent className="p-4 !pt-0 sm:p-6 bg-white">
          <CalendarGrid
            daysInMonth={daysInMonth}
            emptyDays={emptyDays}
            assignments={assignments}
            onDayClick={handleDayClick}
            isSelectMode={isSelectMode}
            selectedDates={selectedDates}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <CalendarSingleCreateModal
        isOpen={singleModalOpen} onOpenChange={setSingleModalOpen}
        selectedDate={selectedDate}
        existingAssignment={existingAssignment}
        formShiftId={formShiftId} setFormShiftId={setFormShiftId}
        availableShifts={availableShifts} hasAvailableShifts={hasAvailableShifts}
        onSave={handleSaveSingle} onDelete={handleDeleteSingle}
      />

      <CalendarBulkCreateModal
        isOpen={bulkModalOpen} onOpenChange={setBulkModalOpen}
        bulkStartDate={bulkStartDate} setBulkStartDate={setBulkStartDate}
        bulkEndDate={bulkEndDate} setBulkEndDate={setBulkEndDate}
        bulkPattern={bulkPattern} setBulkPattern={setBulkPattern}
        availableShifts={availableShifts} hasAvailableShifts={hasAvailableShifts}
        onSave={handleSaveBulk}
      />
    </div>
  )
}
