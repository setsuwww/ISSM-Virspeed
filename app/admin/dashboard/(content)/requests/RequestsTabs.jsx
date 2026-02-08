"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/Tabs"
import RequestsDataTable from "./RequestsTable"

export default function RequestsTabs({
  permissionRequests = [], changeShiftRequests = [], earlyCheckoutRequests = [], leaveRequests = [],
  mode,
}) {
  const isHistory = mode === "history"

  const tabs = [
    { key: "permission", label: "Permission", data: permissionRequests },
    { key: "changeshift", label: "Change Shift", data: changeShiftRequests },
    { key: "early", label: "Early Checkout", data: earlyCheckoutRequests },
    { key: "leave", label: "Leave Request", data: leaveRequests },
  ]

  return (
    <Tabs defaultValue="permission" className="w-full">
      <div className="flex items-center justify-between">
        <TabsList mode="link" className="space-x-2">
          {tabs.map((t) => (
            <TabsTrigger key={t.key} mode="link" value={t.key} className="py-1.5 whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <span>{t.label}</span>

                {t.data?.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-xs ${isHistory ? "bg-yellow-50 text-yellow-600" : "bg-sky-50 text-sky-700"}`}>
                    {t.data.length}
                  </span>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key} className="mt-6">
          <RequestsDataTable type={t.key} items={t.data} isHistory={isHistory} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
