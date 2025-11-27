"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/Tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Button } from "@/_components/ui/Button"
import RequestsTableRow from "./RequestsTableRow"

export default function RequestsTabs({
  shiftRequests = [],
  permissionRequests = [],
  mode,
}) {
  const router = useRouter()

  const isHistory = mode === "history"

  const toggleMode = () => {
    const newMode = isHistory ? "pending" : "history"
    router.push(`?mode=${newMode}`)
  }

  return (
    <Tabs defaultValue="shift" className="w-full">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="shift" className="px-4 py-4 flex items-center justify-center whitespace-nowrap">
            Shift Changes
          </TabsTrigger>
          <TabsTrigger value="permission" className="px-4 py-4 flex items-center justify-center whitespace-nowrap">
            Permissions
          </TabsTrigger>
        </TabsList>

        <Button variant="outline" onClick={toggleMode} className="border-slate-200 shadow-xs">
          <span className="font-semibold text-slate-600">Request:</span>
          <span className="text-slate-400">{isHistory ? "Finished" : "Pending"}</span>
        </Button>
      </div>

      <TabsContent value="shift" className="mt-6">
        {shiftRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-400">
              {isHistory ? "No shift change history" : "No pending shift change requests"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Responser</TableHead>
                <TableHead>Shift Change</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shiftRequests.map((request) => (
                <RequestsTableRow key={request.id} {...request} requestType="shift" />
              ))}
            </TableBody>
          </Table>
        )}
      </TabsContent>

      <TabsContent value="permission" className="mt-6">
        {permissionRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-400">
              {isHistory ? "No permission history" : "No pending permission requests"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested By</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent on</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionRequests.map((request) => (
                <RequestsTableRow key={request.id} {...request} requestType="permission" />
              ))}
            </TableBody>
          </Table>
        )}
      </TabsContent>
    </Tabs>
  )
}
