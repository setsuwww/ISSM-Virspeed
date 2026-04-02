import { prisma } from "@/_lib/prisma"
import ChangeShiftForm from "./ChangeShiftForm"
import ChangeShiftTable from "./ChangeShiftTable"
import { getCurrentUser } from "@/_lib/auth"

export const revalidate = 60

export default async function Page() {
  const user = await getCurrentUser()

  const employees = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      locationId: user.locationId,
      shiftId: { not: null },
      id: { not: user.id },
    },
    include: {
      shift: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  const requests = await prisma.shiftChangeRequest.findMany({
    where: {
      targetUserId: user.id,
    },
    include: {
      user: true,
      oldShift: true,
      targetShift: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="space-y-4">
      <ChangeShiftForm employees={employees} />
      <ChangeShiftTable requests={requests} currentUserId={user.id} />
    </main>
  )
}
