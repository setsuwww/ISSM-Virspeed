"use client"

import { useState, useTransition } from "react"
import useSWR from "swr"
import {
  Search,
  User,
  Send,
  CircleUserRound,
  X,
  Trash2,
} from "lucide-react"
import { sendMail } from "@/_servers/admin-action/mailAction"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/Dialog"
import { Input } from "@/_components/ui/Input"

const fetcher = (url) => fetch(url).then(res => res.json())

export function SendMessageModal({ open, onClose }) {
  const [query, setQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  const { data, isLoading } = useSWR(
    query.length >= 2 ? `/api/users/search?q=${query}` : null,
    fetcher
  )

  /* ---------------- handlers ---------------- */

  const addUser = (user) => {
    setSelectedUsers(prev =>
      prev.find(u => u.id === user.id) ? prev : [...prev, user]
    )
  }

  const removeUser = (id) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== id))
  }

  const clearAll = () => setSelectedUsers([])

  const handleSend = () => {
    if (!selectedUsers.length || !message.trim()) return

    startTransition(async () => {
      await Promise.all(
        selectedUsers.map(user =>
          sendMail({
            to: user.email,
            message,
          })
        )
      )

      setMessage("")
      setSelectedUsers([])
      onClose(false)
    })
  }

  /* ---------------- render ---------------- */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="xl" variant="blue">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={18} />
            Send Message
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-slate-400"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
            typeSearch
          />
        </div>

        {/* Results */}
        <div className="max-h-56 overflow-y-auto rounded-lg border divide-y">
          {isLoading && (
            <p className="text-sm text-slate-400 p-3">Searching...</p>
          )}

          {data?.map(user => {
            const selected = selectedUsers.some(u => u.id === user.id)

            return (
              <button
                key={user.id}
                onClick={() => addUser(user)}
                disabled={selected}
                className={`w-full text-left p-3 transition
                  ${selected ? "bg-slate-50 opacity-60 cursor-not-allowed" : "hover:bg-slate-100"}
                `}
              >
                <div className="flex items-center gap-3">
                  <CircleUserRound strokeWidth={1.5} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}

          {!isLoading && data?.length === 0 && query.length >= 2 && (
            <p className="text-sm text-slate-400 p-3">No users found</p>
          )}
        </div>

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-600">
                Selected recipients ({selectedUsers.length})
              </p>
              <button
                onClick={clearAll}
                className="flex items-center text-xs text-rose-500 px-2 py-0.5 rounded-full hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1"/> Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-300 text-sm shadow-xs"
                >
                  <span className="text-black">{user.email}</span>
                  <button
                    onClick={() => removeUser(user.id)}
                    className="text-slate-900 hover:text-rose-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          rows={5}
          className="w-full border rounded-lg p-3 text-sm"
        />

        {/* Action */}
        <button
          onClick={handleSend}
          disabled={!selectedUsers.length || !message || isPending}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white rounded-lg py-2 disabled:opacity-50"
        >
          <Send size={16} />
          {isPending
            ? "Sending..."
            : `Send to ${selectedUsers.length} user(s)`}
        </button>
      </DialogContent>
    </Dialog>
  )
}
