"use client"

import { TableCell } from "@/_components/ui/Table"

export default function RenderEarlyCheckout({ r }) {
  return (
    <>
      <TableCell>{r.requesterName}</TableCell>
      <TableCell>{r.shiftName}</TableCell>
      <TableCell>{r.reason}</TableCell>
    </>
  )
}
