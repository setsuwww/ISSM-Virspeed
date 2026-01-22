import { NextResponse } from "next/server";
import { prisma } from "@/_lib/prisma";
import { getCurrentUser } from "@/_lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ hasNotifications: false });
    }

    const [pendingPermissions, pendingEarlyCheckout, pendingLeaves, pendingShiftChanges] = await Promise.all([
      prisma.attendance.count({
        where: {
          status: "PERMISSION",
          approval: "PENDING",
        },
      }),

      prisma.earlyCheckoutRequest.count({ where: { status: "PENDING" } }),

      prisma.leaveRequest.count({ where: { status: "PENDING" } }),

      prisma.shiftChangeRequest.count({
        where: {
          status: {
            in: ["PENDING_TARGET", "PENDING_ADMIN"],
          },
        },
      }),
    ]);

    const total = pendingPermissions + pendingEarlyCheckout + pendingLeaves + pendingShiftChanges;

    return NextResponse.json({
      hasNotifications: total > 0,
      counts: {
        permission: pendingPermissions,
        earlyCheckout: pendingEarlyCheckout,
        leave: pendingLeaves,
        changeShift: pendingShiftChanges,
        total,
      },
    });
  } catch (error) {
    console.error("Admin notification error:", error);
    return NextResponse.json(
      { hasNotifications: false },
      { status: 500 }
    );
  }
}
