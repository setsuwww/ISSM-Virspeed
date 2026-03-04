"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/Tabs";
import { Clock3, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TabsNormalHours from "./TabsNormalHours";
import TabsShiftHours from "./TabsShiftHours";

export default function WorkHoursTabs({ divisions, shifts }) {
  const [activeTab, setActiveTab] = useState("normal");
  const [direction, setDirection] = useState(0);

  const handleTabChange = (value) => {
    const order = ["normal", "shift"];
    const newIndex = order.indexOf(value);
    const currentIndex = order.indexOf(activeTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(value);
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.98 }),
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full border-transparent">
      {/* Tabs Header */}
      <TabsList mode="link" className="flex space-x-2 border-b bg-transparent h-8 p-0 min-h-0">
        <TabsTrigger mode="link" value="normal" className="flex items-center gap-2 px-3 py-1.5 h-auto text-sm">
          <Clock3 className="w-4 h-4" />
          Normal Hours
        </TabsTrigger>

        <TabsTrigger mode="link" value="shift" className="flex items-center gap-2 px-3 py-1.5 h-auto text-sm">
          <ClipboardList className="w-4 h-4" />
          Shift Hours
        </TabsTrigger>
      </TabsList>

      <div className="relative mt-4 overflow-hidden min-h-[300px]">
        <AnimatePresence custom={direction} mode="wait">
          {activeTab === "normal" && (
            <motion.div key="normal"
              custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="absolute top-0 left-0 w-full"
            >
              <TabsNormalHours divisions={divisions} />
            </motion.div>
          )}

          {activeTab === "shift" && (
            <motion.div key="shift"
              custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="absolute top-0 left-0 w-full"
            >
              <TabsShiftHours shifts={shifts} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Tabs>
  );
}
