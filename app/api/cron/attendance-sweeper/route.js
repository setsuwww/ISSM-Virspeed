import { NextResponse } from "next/server";
import { runAttendanceSweeper } from "@/_servers/attendanceSweeperAction";

export async function GET(req) {
  // Security Note: In a production app, verify a secret cron key here
  // e.g. if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
  
  const result = await runAttendanceSweeper();
  
  if (result.success) {
    return NextResponse.json({ message: "Sweeper applied successfully", data: result });
  } else {
    return NextResponse.json({ message: "Sweeper failed", error: result.error }, { status: 500 });
  }
}
