import { NextResponse } from "next/server";
import { autoRotateShifts } from "@/_servers/shift_system_action";

export async function GET(req) {
  // Security Note: In a production app, verify a secret cron key here
  // e.g. if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`)

  const result = await autoRotateShifts();

  if (result.success) {
    return NextResponse.json({ message: "Rotation applied successfully", data: result });
  } else {
    return NextResponse.json({ message: "Rotation failed", error: result.error }, { status: 500 });
  }
}
