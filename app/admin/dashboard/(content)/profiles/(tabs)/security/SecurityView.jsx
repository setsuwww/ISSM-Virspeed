"use client"

import { useState, useTransition } from "react"

import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"

import { LogClearButton } from "../../LogClearButton"
import { LogConfirmDialog } from "../../LogConfirmDialog"
import { SecurityTable } from "./SecurityTable"
import { clearAllSecurityLogs } from "@/_server/admin-action/securityAction"

export default function SecurityView({ logs }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClearLogs() {
    startTransition(async () => {
      await clearAllSecurityLogs()
      setOpen(false)
    })
  }

  return (
    <section>
      <ContentForm>
        <ContentForm.Header>
          <div className="flex items-center justify-between">
            <ContentInformation
              heading="Security Logs" autoMargin
              subheading="Audit trail for all user suspicious actions"
            />

            <LogClearButton
              onClick={() => setOpen(true)}
              disabled={isPending}
            />
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <SecurityTable logs={logs} />
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
