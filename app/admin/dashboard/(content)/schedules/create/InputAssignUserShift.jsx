"use client"

import { Check, ChevronsUpDown, CircleUserRound, X, CalendarArrowUp, CalendarArrowDown, Clock } from "lucide-react"
import { useState, useCallback } from "react"
import { useScheduleStore } from "@/_stores/useScheduleStore"

import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"
import { Popover, PopoverTrigger, PopoverContent } from "@/_components/ui/Popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/_components/ui/Command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/_components/ui/Dialog"
import { Badge } from "@/_components/ui/Badge"
import { ContentInformation } from "@/_components/common/ContentInformation"

export default function InputAssignUserShift({ users }) {
  const { addEvent } = useScheduleStore()

  const [form, setForm] = useState({
    startDate: "", startTime: "",
    endDate: "", endTime: "",
    selectedUsers: [],
  })

  const [ui, setUI] = useState({
    open: false, dialogOpen: false,
    dialogMessage: "", dialogType: "success",
  })

  const toggleUser = useCallback(
    (id) => setForm((prev) => ({...prev,
      selectedUsers: prev.selectedUsers.includes(id)
        ? prev.selectedUsers.filter((u) => u !== id) : [...prev.selectedUsers, id],
      })),
    []
  )

  const setAllUsers = useCallback(() => setForm((prev) => ({ ...prev, selectedUsers: users.map((u) => u.id) })), [users])
  const clearUsers = useCallback(() => setForm((prev) => ({ ...prev, selectedUsers: [] })), [])

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    const { startDate, endDate, startTime, endTime, selectedUsers } = form

    if (!startDate || !endDate || !startTime || !endTime || selectedUsers.length === 0) {
      return setUI({
        open: false, dialogOpen: true,
        dialogMessage: "Please fill all required fields.", dialogType: "error",
      })
    }

    addEvent({
      startDate, startTime,
      endDate, endTime,
      users: users.filter((u) => selectedUsers.includes(u.id)),
    })

    setUI({ 
      open: false, dialogOpen: true,
      dialogMessage: `Draft schedule created for ${selectedUsers.length} user(s).`, dialogType: "success",
    })
  }

  const { startDate, endDate, startTime, endTime, selectedUsers } = form
  const { open, dialogOpen, dialogMessage, dialogType } = ui

  return (
    <div className="space-y-6">
      <div className="py-2">
        <ContentInformation
          heading="Assign Users to Schedules"
          subheading="Select date, time, and assign users."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label>Start Date & Time</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="date" className="border rounded-md px-3 py-2 text-sm"
              value={startDate} onChange={handleChange("startDate")}
            />
            <input type="time" className="border rounded-md px-3 py-2 text-sm"
              value={startTime} onChange={handleChange("startTime")}
            />
          </div>

          {(startDate || startTime) && (
            <div className="flex items-center gap-3 text-teal-600 mt-1">
              {startDate && (
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <CalendarArrowUp size={14} />
                  <span>{startDate}</span>
                </div>
              )}
              {startTime && (
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Clock size={14} />
                  <span>{startTime}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>End Date & Time</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="date" className="border rounded-md px-3 py-2 text-sm"
              value={endDate} onChange={handleChange("endDate")}
            />
            <input type="time" className="border rounded-md px-3 py-2 text-sm"
              value={endTime} onChange={handleChange("endTime")}
            />
          </div>

          {(endDate || endTime) && (
            <div className="flex items-center gap-3 text-rose-600 mt-1">
              {endDate && (
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <CalendarArrowDown size={14} />
                  <span>{endDate}</span>
                </div>
              )}
              {endTime && (
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Clock size={14} />
                  <span>{endTime}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Assign Users</Label>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={setAllUsers}>
              Select All
            </Button>
            <Button variant="destructive" size="sm" onClick={clearUsers} disabled={selectedUsers.length === 0}>
              Clear
            </Button>
          </div>
        </div>

        <Popover open={open} onOpenChange={(v) => setUI((p) => ({ ...p, open: v }))}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between bg-white text-sm h-12">
              <div className="flex flex-wrap gap-1.5 items-center min-h-[1.5rem]">
                {selectedUsers.length > 0 ? (
                  selectedUsers.map((id) => {
                    const user = users.find((u) => u.id === id)
                    return (
                      <Badge key={id} variant="outline"
                        className="flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2 py-0.5"
                      >
                        {user?.name}
                        <span role="button" tabIndex={0} onClick={(e) => {e.stopPropagation()
                            toggleUser(id)
                          }} className="cursor-pointer hover:bg-rose-100 rounded-md ml-1"
                        >
                          <X className="h-3 w-3 text-rose-500 hover:text-rose-700" />
                        </span>
                      </Badge>
                    )
                  })
                ) : (<span className="text-slate-500">Select users...</span>)}
              </div>
              <ChevronsUpDown className="h-4 w-4 text-slate-500" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command className="bg-white">
              <CommandInput placeholder="Search users..." className="h-10 text-sm" />
              <CommandEmpty className="py-4 text-center text-sm text-slate-500">
                No users found.
              </CommandEmpty>

              <CommandGroup className="max-h-64 overflow-y-auto">
                {users.map((user) => {
                  const isSelected = selectedUsers.includes(user.id)
                  return (
                    <CommandItem key={user.id} value={user.name} onSelect={() => toggleUser(user.id)}
                      className="group cursor-pointer flex items-center justify-between rounded-md px-3 py-2 mb-1 hover:bg-slate-50 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="p-2.5 rounded-lg bg-slate-100 group-hover:bg-slate-200">
                          <CircleUserRound className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{user.name}</span>
                          <span className="text-xs text-slate-400">{user.email}</span>
                        </div>
                        {isSelected && (
                          <div className="ml-auto bg-teal-100/60 p-1.5 rounded-md">
                            <Check className="h-4 w-4 text-teal-600" />
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" onClick={handleSubmit} disabled={!startDate || !endDate || selectedUsers.length === 0}
          variant="ghost"
        >
          Generate Schedule
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => setUI((p) => ({ ...p, dialogOpen: v }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogType === "success" ? "Success" : "Error"}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUI((p) => ({ ...p, dialogOpen: false }))}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
