"use client"

import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/_components/ui/Card"
import { useShiftCalendarHooks, useShiftSelection, useBulkPreset } from "@/_clients/hooks/admin/useShiftCalendarHooks"

// Modular Components
import ShiftCalendarActionBar from "./ShiftCalendarActionBar"
import CalendarGrid from "./CalendarGrid"
import CalendarSingleCreateModal from "../modal/CalendarSingleCreateModal"
import CalendarBulkCreateModal from "../modal/CalendarBulkCreateModal"
import AssignModal from "../modal/AssignModal"
import EditModal from "../modal/EditModal"

export default function ShiftCalendar({ user, assignments = [], shifts = [], selectedMonth }) {
  const mainHooks = useShiftCalendarHooks({ user, assignments, shifts, selectedMonth })

  const {
    assignmentMap,
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

  const selectionHooks = useShiftSelection(user?.id, assignmentMap)
  const presetHooks = useBulkPreset(user?.id, daysInMonth, assignmentMap)

  const {
    isSelectMode, selectedDates, toggleSelectMode, toggleDateSelection, selectAll,
    handleBulkDelete, filledDates, emptyDates,
    assignModalOpen, setAssignModalOpen, editModalOpen, setEditModalOpen,
    handleBulkSubmit, loading: selectionLoading
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
    <div className="w-full relative border border-slate-300 rounded-xl">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Processing...</span>
          </div>
        </div>
      )}

      <Card className="rounded-2xl border-slate-100 overflow-hidden mb-12 !p-0 border">
        <ShiftCalendarActionBar
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          isSelectMode={isSelectMode}
          toggleSelectMode={toggleSelectMode}
          filledCount={filledDates.length}
          emptyCount={emptyDates.length}
          onBulkDelete={handleBulkDelete}
          onBulkEdit={() => setEditModalOpen(true)}
          onBulkAssign={() => setAssignModalOpen(true)}
          onDeleteAll={handleDeleteAll}
          onSelectAll={() => selectAll(daysInMonth)}

          // Presets
          presetMode={presetMode}
          setPresetMode={setPresetMode}
          presetShiftId={presetShiftId}
          setPresetShiftId={setPresetShiftId}
          onApplyPreset={handleApplyPreset}
          availableShifts={availableShifts}
          loading={isLoading}
        />

        <CardContent className="p-6 bg-white">
          <CalendarGrid
            daysInMonth={daysInMonth}
            emptyDays={emptyDays}
            assignmentMap={assignmentMap}
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

      <AssignModal
        isOpen={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        selectedDates={emptyDates}
        availableShifts={availableShifts}
        assignmentMap={assignmentMap}
        onConfirm={handleBulkSubmit}
        loading={selectionLoading}
      />

      <EditModal
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        selectedDates={filledDates}
        availableShifts={availableShifts}
        assignmentMap={assignmentMap}
        onConfirm={handleBulkSubmit}
        loading={selectionLoading}
      />
    </div>
  )
}
