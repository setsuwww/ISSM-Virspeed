import { NextResponse } from "next/server";
import { batchAutoCheckout } from "@/_functions/helpers/attendanceHelpers";

export async function GET(request) {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET_KEY;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await batchAutoCheckout();
        return NextResponse.json({
            success: true,
            processed: result.processed,
            message: `Auto checkout completed for ${result.processed} users`,
        });
    } catch (error) {
        console.error("Cron job error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
