"use client"

import { useState, useTransition } from "react"
import useSWR from "swr"
import { X, Search, User, Send } from "lucide-react"
import { sendMail } from "@/_server/admin-action/mailAction"

const fetcher = (url) => fetch(url).then(res => res.json())

export function SendMessageModal({ open, onClose }) {
  const [query, setQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  const { data, isLoading } = useSWR(
    query.length >= 2 ? `/api/users/search?q=${query}` : null,
    fetcher
  )

  if (!open) return null

  const handleSend = () => {
    if (!selectedUser || !message.trim()) return

    startTransition(async () => {
      await sendMail({
        to: selectedUser.email,
        message,
      })

      setMessage("")
      setSelectedUser(null)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <User size={18} /> Send Message
          </h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* Results */}
        <div className="max-h-40 overflow-y-auto border rounded-lg mb-3">
          {isLoading && <p className="text-sm text-slate-400 p-3">Searching...</p>}

          {data?.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="w-full text-left px-3 py-2 hover:bg-slate-100"
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </button>
          ))}
        </div>

        {/* Message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          className="w-full border rounded-lg p-2 text-sm mb-3"
          rows={4}
        />

        {/* Action */}
        <button
          onClick={handleSend}
          disabled={!selectedUser || !message || isPending}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white rounded-lg py-2 disabled:opacity-50"
        >
          <Send size={16} />
          {isPending ? "Sending..." : "Send Message"}
        </button>
      </div>
    </div>
  )
}
