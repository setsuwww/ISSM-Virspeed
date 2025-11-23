"use client"

import { useCallback } from "react"
import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"
import { Popover, PopoverTrigger, PopoverContent } from "@/_components/ui/Popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/_components/ui/Command"
import { Badge } from "@/_components/ui/Badge"
import { Check, ChevronsUpDown, CircleUserRound, X } from "lucide-react"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { useScheduleStore } from "@/_stores/useScheduleStore"

export default function UpdateAssignUserShift({ users }) {
  const { events, setEvents } = useScheduleStore()
  const event = events[0] || { startDate: "", endDate: "", startTime: "", endTime: "", users: [] }

  const setEventField = useCallback((field, value) => setEvents([{ ...event, [field]: value }]),
    [event, setEvents]
  )

  const toggleUser = useCallback(
    (id) => { const isSelected = event.users.some((u) => u.id === id)
      const updatedUsers = isSelected
        ? event.users.filter((u) => u.id !== id)
        : [...event.users, users.find((u) => u.id === id)]
      setEventField("users", updatedUsers)
    },
    [event.users, users, setEventField]
  )

  const setAllUsers = useCallback(() => setEventField("users", users), [users, setEventField])
  const clearUsers = useCallback(() => setEventField("users", []), [setEventField])

  return (
    <div className="space-y-6">
      <div className="py-2">
        <ContentInformation heading="Assign Users to Schedules" subheading="Select date, time, and assign users." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label>Start Date & Time</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={event.startDate}
              onChange={(e) => setEventField("startDate", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={event.startTime}
              onChange={(e) => setEventField("startTime", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>End Date & Time</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={event.endDate}
              onChange={(e) => setEventField("endDate", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={event.endTime}
              onChange={(e) => setEventField("endTime", e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Assign Users</Label>
          <div className="flex space-x-2">
            <Button onClick={setAllUsers} size="sm" variant="outline">
              Select All
            </Button>
            <Button onClick={clearUsers} size="sm" variant="destructive" disabled={!event.users.length}>
              Clear
            </Button>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-full justify-between bg-white text-sm h-12">
              <div className="flex flex-wrap gap-1.5 items-center">
                {event.users.length ? (
                  event.users.map((u) => (
                    <Badge key={u.id} variant="secondary" className="flex items-center gap-1 bg-slate-50 border text-slate-700 text-xs px-2">
                      {u.name}
                      <X
                        className="h-3 w-3 text-rose-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleUser(u.id)
                        }}
                      />
                    </Badge>
                  ))
                ) : (
                  <span className="text-slate-500">Select users...</span>
                )}
              </div>
              <ChevronsUpDown className="h-4 w-4 text-slate-500" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {users.map((u) => {
                  const isSelected = event.users.some((x) => x.id === u.id)
                  return (
                    <CommandItem key={u.id} onSelect={() => toggleUser(u.id)}>
                      <div className="flex items-center gap-3">
                        <CircleUserRound className="h-5 w-5 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                        {isSelected && <Check className="ml-auto h-4 w-4 text-teal-600" />}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
