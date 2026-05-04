"use client"

import { Button } from "@/_components/ui/Button"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"

export default function CalendarNavigationAction({ onPrevMonth, onNextMonth, formattedMonth, onDeleteAll }) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-400/70 rounded-full p-1">
                    <button onClick={onPrevMonth} className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-red-600 min-w-[120px] text-center text-sm">
                        {formattedMonth}
                    </span>
                    <button onClick={onNextMonth} className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={onDeleteAll} variant="outline" size="sm"
                    className="text-red-600 border-slate-300 hover:text-red-700 bg-white h-9 rounded-md"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                </Button>
            </div>
        </div>
    )
}
