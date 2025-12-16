"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/_components/ui/Tabs";
import { Clock3, ClipboardList } from "lucide-react";

import TabsNormalHours from "./TabsNormalHours";
import TabsShiftHours from "./TabsShiftHours";

export default function WorkHoursTabs({ divisions, shifts }) {
  const [activeTab, setActiveTab] = useState("normal");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full border-transparent">
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

      <TabsContent value="normal" className="pt-4">
        <TabsNormalHours divisions={divisions} />
      </TabsContent>

      <TabsContent value="shift" className="pt-4">
        <TabsShiftHours shifts={shifts} />
      </TabsContent>

    </Tabs>
  );
}
