import { getCurrentUser } from "@/_lib/auth"
import { ProfileView } from "./ProfileView"
import { prisma } from "@/_lib/prisma"
import { getNowJakarta } from "@/_lib/time"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) return null

  const now = getNowJakarta()
  const startOfDay = now.clone().startOf('day').toDate()
  const endOfDay = now.clone().endOf('day').toDate()

  const todayAssignment = await prisma.shiftAssignment.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      shift: true
    }
  })

  return (
    <div>
      <ProfileView user={user} todayAssignment={todayAssignment} />
    </div>
  )
}
