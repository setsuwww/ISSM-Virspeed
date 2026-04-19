import { startingShiftUpdate, resetExpiredShiftChanges } from "@/_servers/admin-action/shift_action"
import dayjs from "@/_lib/day"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const testDate = searchParams.get("testDate")

  const simulatedToday = testDate ? dayjs(testDate) : dayjs()

  try {
    console.log("========== AUTO SHIFT CHANGE ==========")
    console.log("Simulated date:", simulatedToday.format("YYYY-MM-DD"))

    const started = await startingShiftUpdate(simulatedToday)
    console.log("✅ startingShiftUpdate result:", started)

    const expired = await resetExpiredShiftChanges(simulatedToday)
    console.log("✅ resetExpiredShiftChanges result:", expired)

    return Response.json({
      success: true,
      simulatedDate: simulatedToday.toISOString(),
      started,
      expired,
    })
  } catch (error) {
    console.error("❌ AutoShift ERROR:", error)
    return Response.json(
      {
        success: false,
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
