import cron from "node-cron"
import { updateUsersShiftAssignment } from "./update_users_shift_assignment"

// jalan tiap jam 00:00
cron.schedule("0 0 * * *", async () => {
    console.log("Running auto shift rotation...")

    try {
        const result = await updateUsersShiftAssignment()
        console.log("Shift updated:", result)
    } catch (err) {
        console.error("Shift error:", err)
    }
})
