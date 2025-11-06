"use client"

import React, { useState } from "react"
import { CircleUserRound, Search, CalendarSync, Loader } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Label } from "@/_components/ui/Label"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"

import { apiFetchData } from "@/_function/helpers/fetch"
import { capitalize } from "@/_function/globalFunction"
import { shiftStyles } from "@/_constants/shiftConstants"

export const EmployeesSwitchModal = React.memo(function EmployeesSwitchModal({ open, onOpenChange, currentUserId }) {
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data: currentUser, isLoading: loadingCurrent } = useQuery({
    queryKey: ["currentUser", currentUserId],
    queryFn: () =>
      apiFetchData({ url: `/users/${currentUserId}`, method: "get"}),
    enabled: open && !!currentUserId,
  })

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["usersToSwitch", currentUserId],
    queryFn: () =>
      apiFetchData({ url: `/users/${currentUserId}/switch`, method: "get" }),
    enabled: open && !!currentUserId,
  })

  const swapMutation = useMutation({
    mutationFn: () => apiFetchData({ url: `/users/${currentUserId}/switch`, method: "post", data: { otherUserId: selectedId }}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser", currentUserId] })
      await queryClient.invalidateQueries({ queryKey: ["usersToSwitch", currentUserId] })
      onOpenChange(false)
    },
  })

  const filteredUsers = users?.filter(
    (u) => u.id !== currentUserId &&
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  ) ?? []

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) { setSelectedId(null)
        setSearch("")
      }
      onOpenChange(val)
    }}
    >
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-sky-100 rounded-full">
                <CalendarSync size={26} />
              </div>
              <span>Swap shift</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loadingCurrent ? (<p className="flex items-center space-x-1 text-xs text-slate-400"><Loader className="w-4 h-4 animate-spin mr-2" /> Loading current user...</p>)
          : (currentUser && (
            <header>
              <Label htmlFor="past" className="mb-4">
                Current user
              </Label>
              <div className="flex items-center border border-slate-300 rounded p-2 space-x-2 bg-slate-100 text-slate-600">
                <div className="p-2 rounded-full bg-slate-300">
                  <CircleUserRound strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{currentUser.name}</p>
                  <p className="text-xs">{currentUser.email}</p>
                </div>
              </div>
            </header>
          ))
        }

        <Label htmlFor="search">Search & switch user</Label>
        <div className="relative mb-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search user..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8" typeSearch={true}
          />
        </div>

        <section className="max-h-80 overflow-y-auto border border-slate-100 shadow-xs rounded-lg p-3">
          {loadingUsers ? (<p className="flex items-center justify-center text-xs text-center text-slate-400"><Loader className="w-4 h-4 animate-spin mr-2" />Loading users...</p>)
            : filteredUsers.length === 0 ? (<p className="text-xs text-center text-slate-400">No users found</p>)
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredUsers.map((user) => (
                    <label key={user.id} className="group flex items-center gap-x-3 cursor-pointer border border-slate-200 px-4 py-3 rounded-lg transition hover:bg-slate-50" >
                      <Checkbox checked={selectedId === user.id} onCheckedChange={() => setSelectedId(user.id)} />
                      <div className="flex items-center gap-x-3 flex-1">
                        <div className="p-2 bg-slate-100 group-hover:bg-sky-100 rounded-lg flex items-center justify-center transition">
                          <CircleUserRound
                            strokeWidth={1.5}
                            className="text-slate-400 group-hover:text-sky-600 transition"
                          />
                        </div>

                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                          <p className={`px-2 py-0.5 rounded-md text-xs ml-3 ${shiftStyles[user.shift?.type ?? "bg-slate-100"]}`}>
                            {capitalize(user.shift?.type ?? "OFF")}
                          </p>
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
              ? (<><Loader />Swapping...</>) 
              : "Confirm"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
})