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
    queryFn: () => apiFetchData({ url: `/users/${currentUserId}/switch`, method: "get" }),
    enabled: open && !!currentUserId,
  })

  const swapMutation = useMutation({
    mutationFn: () =>
      apiFetchData({ url: `/users/${currentUserId}/switch`, method: "post", data: { otherUserId: selectedId } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser", currentUserId] })
      await queryClient.invalidateQueries({ queryKey: ["usersToSwitch", currentUserId] })
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
      onOpenChange={(val) => {
        if (!val) reset()
        onOpenChange(val)
      }}
    >
      <DialogContent
        className="sm:max-w-4xl p-0"
      >
        {/* Header */}
        <div className="border-b px-6 py-5">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-100">
                  <CalendarSync className="h-6 w-6 text-indigo-600" />
                </div>

                <div className="flex flex-col gap-0.5">
                  <h1 className="text-xl font-semibold">
                    Swap shift
                  </h1>
                  <p className="text-sm text-slate-500">
                    Swap employee shift one by one
                  </p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 px-6 py-5">
          {/* Current user */}
          <section className="space-y-2">
            <Label>Current user</Label>

            {loadingCurrent ? (
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Loader className="h-4 w-4 animate-spin" />
                Loading current user
              </p>
            ) : currentUser && (
              <div className="flex items-center gap-4 rounded-xl border bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                  <CircleUserRound className="text-slate-600" />
                </div>

                <div className="flex flex-col">
                  <p className="text-sm font-medium text-slate-700">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Search */}
          <section className="space-y-2">
            <Label>Search user</Label>
            <p className="text-xs text-slate-500 max-w-xl">
              Search users in the same division to swap shift
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                typeSearch
              />
            </div>
          </section>

          {/* Users list */}
          <section className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto rounded-xl border p-3">
              {loadingUsers ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading users
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="py-10 text-center text-xs text-slate-400">
                  No users found
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredUsers.map((u) => (
                    <label key={u.id} className="group flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition hover:bg-slate-50">
                      <Checkbox checked={selectedId === u.id} onCheckedChange={() => setSelectedId(u.id)}/>

                      <div className="flex flex-1 items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 transition group-hover:bg-indigo-100">
                          <CircleUserRound className="text-slate-400 group-hover:text-indigo-600" />
                        </div>

                        <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                          <div className="flex flex-col min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700">
                              {u.name}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {u.email}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${shiftStyles[u.shift.type]}`}
                          >
                            {capitalize(u.shift.type)}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button
            disabled={!selectedId || swapMutation.isPending}
            onClick={() => swapMutation.mutate()}
          >
            {swapMutation.isPending ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Swapping
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
