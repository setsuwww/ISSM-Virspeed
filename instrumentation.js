export async function register() {
    if (process.env.NEXT_RUNTIME === "node") {
        const { initAttendanceCron } = await import("./_jobs/content/attendance/attendance_cron")
        initAttendanceCron()

        try {
            await import("./_jobs/content/shift/shift_cron")
            console.log("[CRON] Shift rotation cron initialized.")
        } catch (err) {
            console.error("[CRON] Failed to initialize shift cron:", err)
        }
    }
}
