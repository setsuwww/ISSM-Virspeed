"use client"

import { useState, useTransition } from "react"
import { clearAllActivityLogs } from "@/_server/admin-action/logAction"

import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"

import LogCard from "./LogCard"
import { LogClearButton } from "./LogClearButton"
import { LogConfirmDialog } from "./LogConfirmDialog"

export default function LogView({ logs }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClearLogs() {
    startTransition(async () => {
      await clearAllActivityLogs()
      setOpen(false)
    })
  }

  return (
    <section>
      <ContentForm>
        <ContentForm.Header>
          <div className="flex items-center justify-between">
            <ContentInformation
              heading="Activity Logs" autoMargin
              subheading="Audit trail for all user actions"
            />

            <LogClearButton
              onClick={() => setOpen(true)}
              disabled={isPending}
            />
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <LogCard logs={logs} />
        </ContentForm.Body>
      </ContentForm>

      <LogConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleClearLogs}
        loading={isPending}
      />
    </section>
  )
}
