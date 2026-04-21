export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json(
                { error: "userId wajib diisi" },
                { status: 400 }
            )
        }

        // Ambil user + relasi penting
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                location: true,
                shift: true,
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Ambil assignment hari ini
        const today = new Date()
        const assignment = await prisma.shiftAssignment.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: new Date(today.setHours(0, 0, 0, 0))
                }
            },
            include: {
                shift: true
            }
        })

        // Ambil attendance aktif
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                checkOutTime: null,
            },
            orderBy: { date: "desc" }
        })

        // 🔥 CORE LOGIC (ini yang lu cari)
        let shiftData = null

        if (assignment?.shift) {
            // PRIORITY 1: shift assignment
            shiftData = {
                id: assignment.shift.id,
                name: assignment.shift.name,
                startTime: assignment.shift.startTime,
                endTime: assignment.shift.endTime,
                type: "SHIFT_ASSIGNMENT"
            }
        } else if (user.shift) {
            // PRIORITY 2: default shift user
            shiftData = {
                id: user.shift.id,
                name: user.shift.name,
                startTime: user.shift.startTime,
                endTime: user.shift.endTime,
                type: "SHIFT_USER"
            }
        } else if (user.location?.startTime != null) {
            // PRIORITY 3: jam kerja normal
            shiftData = {
                id: null,
                name: user.location.name || "Normal Hours",
                startTime: user.location.startTime,
                endTime: user.location.endTime,
                type: "NORMAL"
            }
        }

        return NextResponse.json({
            shift: shiftData,
            attendance: attendance
                ? {
                    id: attendance.id,
                    checkInTime: attendance.checkInTime,
                }
                : null,
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
