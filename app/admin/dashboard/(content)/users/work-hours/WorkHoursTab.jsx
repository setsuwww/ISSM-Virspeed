"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/_components/ui/Tabs";
import { Clock3, ClipboardList } from "lucide-react";

import TabsNormalHours from "./TabsNormalHours";
import TabsShiftHours from "./TabsShiftHours";

export default function WorkHoursTab({ divisions, shifts }) {
  const [activeTab, setActiveTab] = useState("normal");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList mode="link"
        className="flex space-x-2 border-b bg-transparent h-auto [&>*]:bg-transparent"
      >
        <TabsTrigger mode="link" value="normal" className="flex items-center space-x-2">
          <Clock3 className="w-4 h-4 mr-2" />
          Normal Hours
        </TabsTrigger>

        <TabsTrigger mode="link" value="shift" className="flex items-center space-x-2">
          <ClipboardList className="w-4 h-4 mr-2" />
          Shift Hours
        </TabsTrigger>
      </TabsList>

      <TabsContent value="normal">
        <TabsNormalHours divisions={divisions} />
      </TabsContent>

      <TabsContent value="shift">
        <TabsShiftHours shifts={shifts} />
      </TabsContent>
    </Tabs>
  );
}
