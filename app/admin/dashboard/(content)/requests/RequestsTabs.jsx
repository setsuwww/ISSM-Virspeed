"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/Tabs"
import RequestsDataTable from "./RequestsTable"
import { motion, AnimatePresence } from "framer-motion"

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

  const [activeTab, setActiveTab] = useState("permission")
  const [direction, setDirection] = useState(0) // 1 = right, -1 = left

  const handleTabChange = (value) => {
    const newIndex = tabs.findIndex((t) => t.key === value)
    const currentIndex = tabs.findIndex((t) => t.key === activeTab)
    setDirection(newIndex > currentIndex ? 1 : -1)
    setActiveTab(value)
  }

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.98 }),
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex items-center justify-between">
        <TabsList mode="link" className="space-x-2">
          {tabs.map((t) => (
            <TabsTrigger key={t.key} mode="link" value={t.key} className="py-1.5 whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <span>{t.label}</span>
                {t.data?.length > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md ${
                      isHistory
                        ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                        : "bg-sky-50 text-sky-700 border border-sky-200"
                    }`}
                  >
                    {t.data.length}
                  </span>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="relative mt-6 h-[400px] overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          {tabs
            .filter((t) => t.key === activeTab)
            .map((t) => (
              <motion.div
                key={t.key}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-0 left-0 w-full h-full"
              >
                <RequestsDataTable type={t.key} items={t.data} isHistory={isHistory} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </Tabs>
  )
}
