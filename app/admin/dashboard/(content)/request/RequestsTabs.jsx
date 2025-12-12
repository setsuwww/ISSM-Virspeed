"use client"

import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/Tabs"
import { Button } from "@/_components/ui/Button"
import RequestsDataTable from "./RequestsDataTable"

export default function RequestsTabs({
  permissionRequests = [], changeShiftRequests = [], earlyCheckoutRequests = [], leaveRequests = [],
  mode,
}) {
  const router = useRouter()
  const isHistory = mode === "history"

  const toggleMode = () => {router.push(`?mode=${isHistory ? "pending" : "history"}`)}

  const tabs = [
    { key: "permission", label: "Permission", data: permissionRequests },
    { key: "changeshift", label: "Change Shift", data: changeShiftRequests },
    { key: "earlycheckout", label: "Early Checkout", data: earlyCheckoutRequests },
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
                  <span className="text-[10px] px-2 py-0.5 rounded-xs bg-yellow-50 text-yellow-600">
                    {t.data.length}
                  </span>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <Button variant="outline" onClick={toggleMode} className="border-slate-200 shadow-xs">
          <span className="font-semibold text-slate-600">Request:</span>
          <span className="text-slate-400">
            {isHistory ? "Finished" : "Pending"}
          </span>
        </Button>
      </div>

      {tabs.map((t) => (
        <TabsContent key={t.key} value={t.key} className="mt-6">
          <RequestsDataTable type={t.key} items={t.data} isHistory={isHistory}/>
        </TabsContent>
      ))}
    </Tabs>
  )
}
