"use client"

import { useState } from "react"
import { Calendar, ChevronDown } from "lucide-react"

import { Badge } from "@/_components/ui/Badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/_components/ui/Popover"

import { cn } from "@/_lib/utils"

export default function AssignedAtModal({ info, userName }) {
    const [open, setOpen] = useState(false)

    const getBadgeStyles = (totalMonths) => {
        if (totalMonths === 0) {
            return "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
        }

        if (totalMonths === 1) {
            return "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
        }

        return "bg-lime-50 text-lime-600 border-lime-100 hover:bg-lime-100"
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                    className="inline-block"
                >
                    <Badge
                        variant="outline"
                        className={cn(
                            "cursor-help transition-all duration-300 font-semibold px-2.5 py-1 text-[10px] tracking-wide",
                            getBadgeStyles(info.totalMonths)
                        )}
                    >
                        {info.status} <ChevronDown
                            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                        />
                    </Badge>
                </div>
            </PopoverTrigger>

            <PopoverContent
                side="top"
                align="center"
                className="w-64 rounded-2xl border border-slate-300 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-5"
            >
                <div className="space-y-3">
                    <div className="border-b border-slate-100 pb-3">
                        <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                            {userName}
                        </h4>

                        <p className="text-[10px] text-slate-400 tracking-wide">
                            Scheduling Statistics
                        </p>
                    </div>

                    <div className="flex items-center gap-2 py-2 px-2 bg-slate-100 rounded-lg border border-slate-100">
                        <div className="bg-white border border-slate-200 p-2 rounded-md shadow-sm">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">
                                {info.totalMonths}{" "}
                                {info.totalMonths === 1 ? "Month" : "Months"}
                            </span>

                            <span className="text-xs text-slate-400">
                                Total Scheduled
                            </span>
                        </div>
                    </div>

                    {info.months.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-400 tracking-wide pl-1">
                                Active schedule at :
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {info.months.map((month) => (
                                    <span
                                        key={month}
                                        className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md font-medium"
                                    >
                                        {month}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
