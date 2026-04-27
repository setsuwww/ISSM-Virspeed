import { Bell } from "lucide-react"
import { Button } from "@/_components/ui/Button"

export function RequestToast({ summary }) {
    return (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-300 text-blue-500 gap-3 p-6 mb-8 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 border border-blue-300 rounded-md">
                    <Bell className="text-blue-50" />
                </div>

                <div className="flex flex-col">
                    <p className="font-medium text-blue-700">
                        {summary.total} Pending Requests
                    </p>

                    <p className="text-xs font-light text-blue-600">
                        Leave: <b className="font-medium">{summary.breakdown.leave}</b> •
                        Early: <b className="font-medium">{summary.breakdown.earlyCheckout}</b> •
                        Shift: <b className="font-medium">{summary.breakdown.shiftChange}</b> •
                        Permission: <b className="font-medium">{summary.breakdown.permission}</b>
                    </p>
                </div>
            </div>

            <Button className="bg-white border border-blue-400 shadow-xs text-blue-700">
                View Detail
            </Button>
        </div>
    )
}
