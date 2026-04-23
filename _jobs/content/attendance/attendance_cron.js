import cron from "node-cron"
import { batchAutoCheckout } from "@/_functions/helpers/attendanceServerHelpers"

// Run every 5 minutes
export function initAttendanceCron() {
    console.log("[CRON] Initializing attendance cron jobs...")
    
    cron.schedule("*/5 * * * *", async () => {
        console.log("[CRON] Running auto-checkout check...")
        try {
            const result = await batchAutoCheckout()
            if (result.processed > 0) {
                console.log(`[CRON] Auto-checked out ${result.processed} users.`)
            }
        } catch (err) {
            console.error("[CRON] Auto-checkout error:", err)
        }
    })
}
