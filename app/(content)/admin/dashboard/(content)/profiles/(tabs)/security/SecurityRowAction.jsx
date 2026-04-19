"use client"

import { blockUser, unblockUser, markSuspicious, unmarkSuspicious, clearUserSession } from "@/_servers/admin-services/security_action"
import { Flag, Prohibit, LockOpen } from "phosphor-react"
import { useTransition } from "react"

export function SecurityRowAction({ log, onUserUpdate }) {
  const [pending, startTransition] = useTransition()
  const user = log.user
  if (!user) return null

  const handleBlock = () => {
    startTransition(async () => {
      await blockUser(user.id)
      onUserUpdate(user.id, { isLocked: true })
    })
  }

  const handleUnblock = () => {
    startTransition(async () => {
      await unblockUser(user.id)
      onUserUpdate(user.id, { isLocked: false })
    })
  }

  const handleFlag = () => {
    startTransition(async () => {
      await markSuspicious(user.id)
      onUserUpdate(user.id, { isFlagged: true })
    })
  }

  const handleUnflag = () => {
    startTransition(async () => {
      await unmarkSuspicious(user.id)
      onUserUpdate(user.id, { isFlagged: false })
    })
  }

  const handleLogout = () => {
    startTransition(() => clearUserSession(user.id))
  }

  return (
    <div className="flex gap-2">
      {user.isLocked ? (
        <button
          onClick={() =>
            startTransition(handleUnblock)
          }
          className="flex items-center text-sm px-2 py-1 rounded bg-green-50 text-green-700"
        >
          <LockOpen size={16} color="#008236" weight="duotone" className="mr-1" /> Unblock
        </button>
      ) : (
        <button
          onClick={() =>
            startTransition(handleBlock)
          }
          className="flex items-center text-sm px-2 py-1 rounded bg-red-50 text-red-700"
        >
          <Prohibit size={16} color="#c10007" weight="duotone" className="mr-1" /> Block
        </button>
      )}

      {user.isFlagged ? (
        <button
          onClick={() =>
            startTransition(handleUnflag)
          }
          className="flex items-center text-sm px-2 py-1 rounded bg-slate-100 text-slate-700"
        >
          Unflag
        </button>
      ) : (
        <button
          onClick={() =>
            startTransition(handleFlag)
          }
          className="flex items-center text-sm px-2 py-1 rounded bg-yellow-50 text-yellow-700"
        >
          <Flag size={16} color="#a65f00" weight="duotone" className="mr-1" /> Flag
        </button>
      )}

      <button
        onClick={() =>
          startTransition(handleLogout)
        }
        className="flex items-center text-sm px-2 py-1 rounded bg-slate-200"
      >
        Logout
      </button>
    </div>
  )
}
