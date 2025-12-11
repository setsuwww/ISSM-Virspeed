"use client"

import { CircleUserRound, Search, CalendarSync, Loader } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEmployeeSwitchStore } from "@/_stores/useEmployeeSwitchStore"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Label } from "@/_components/ui/Label"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"

import { apiFetchData } from "@/_lib/fetch"
import { capitalize } from "@/_function/globalFunction"
import { shiftStyles } from "@/_constants/shiftConstants"

export function EmployeesSwitchModal({ open, onOpenChange, currentUserId }) {
  const { selectedId, search, setSelectedId, setSearch, reset } =
    useEmployeeSwitchStore()

  const queryClient = useQueryClient()

  const { data: currentUser, isLoading: loadingCurrent } = useQuery({
    queryKey: ["currentUser", currentUserId],
    queryFn: () => apiFetchData({ url: `/users/${currentUserId}`, method: "get" }),
    enabled: open && !!currentUserId,
  })

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["usersToSwitch", currentUserId],
    queryFn: () => apiFetchData({ url: `/users/${currentUserId}/switch`, method: "get"}),
    enabled: open && !!currentUserId,
  })

  const swapMutation = useMutation({
    mutationFn: () =>
      apiFetchData({ url: `/users/${currentUserId}/switch`, method: "post", data: { otherUserId: selectedId }}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ["currentUser", currentUserId]})
      await queryClient.invalidateQueries({queryKey: ["usersToSwitch", currentUserId]})
      reset()
      onOpenChange(false)
    },
  })

  const filteredUsers =
    users?.filter((u) => [u.name.toLowerCase(), u.email.toLowerCase()].some((x) =>
      x.includes(search.toLowerCase())
    )) ?? []

  return (
    <Dialog open={open}
      onOpenChange={(val) => { if (!val) reset()
        onOpenChange(val)
      }}
    >
      <DialogContent className="sm:max-w-4xl h-full rounded-none" position="right">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-sky-100 rounded-full">
                <CalendarSync size={26} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">Swap shift drawer</h1>
                <p className="text-sm font-base text-slate-400">Change 1 employee's shift one by one</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loadingCurrent ? (
          <p className="flex items-center text-xs text-slate-400 mb-2">
            <Loader className="w-4 h-4 animate-spin mr-2" /> Loading current user...
          </p>
        ) : (
          currentUser && (
            <div>
              <Label className="mb-1 block">Current user</Label>

              <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg p-3 space-x-3">
                <div className="p-2 bg-slate-200 rounded-full">
                  <CircleUserRound />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-700">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        <Label className="mt-4 block">Search user</Label>
        <p className="text-xs max-w-lg">
          Search users, and then select users in one division with current user to swap shift
        </p>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input className="pl-8" placeholder="Search by name or email…" 
            value={search} onChange={(e) => setSearch(e.target.value)} typeSearch
          />
        </div>

        <section className="max-h-80 overflow-y-auto border border-slate-100 shadow-xs rounded-lg p-3">
          {loadingUsers ? (
            <p className="flex items-center justify-center text-xs text-slate-400">
              <Loader className="w-4 h-4 animate-spin mr-2" /> Loading users…
            </p>
          ) 
          : filteredUsers.length === 0 ? (<p className="text-xs text-center text-slate-400">No users found</p>) 
          : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredUsers.map((u) => (
                <label key={u.id}
                  className="flex items-center gap-3 cursor-pointer border border-slate-200 px-4 py-3 rounded-lg hover:bg-slate-50 transition group"
                >
                  <Checkbox checked={selectedId === u.id} onCheckedChange={() => setSelectedId(u.id)}/>

                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-sky-100 transition">
                      <CircleUserRound className="text-slate-400 group-hover:text-sky-600" />
                    </div>

                    <div className="w-full flex items-center justify-between">
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {u.email}
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-xs ${shiftStyles[u.shift.type]}`}>
                        {capitalize(u.shift.type)}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button disabled={!selectedId || swapMutation.isPending} onClick={() => swapMutation.mutate()}>
            {swapMutation.isPending 
              ? (<><Loader className="w-4 h-4 animate-spin mr-2" />Swapping...</>) 
              : ("Confirm")
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
