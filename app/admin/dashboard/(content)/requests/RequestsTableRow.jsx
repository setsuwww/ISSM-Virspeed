"use client"

import { TableRow } from "@/_components/ui/Table"

import RenderPermission from "./page/renderPermission"
import RenderChangeShift from "./page/renderChangeShift"
import RenderEarlyCheckout from "./page/renderEarlyCheckout"
import RenderLeave from "./page/renderLeave"

export default function RequestsTableRow({ requestType, onStatusChange, onReject, ...r }) {
  const components = {
    permission: RenderPermission,
    changeshift: RenderChangeShift,
    early: RenderEarlyCheckout,
    leave: RenderLeave,
  }

  const Component = components[requestType]

  return (
    <TableRow>
      <Component r={r} onStatusChange={onStatusChange} onReject={onReject} requestId={r.id} />
    </TableRow>
  )
}
