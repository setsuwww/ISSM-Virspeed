import { getCurrentUser } from "@/_lib/auth"
import { prisma } from "@/_lib/prisma"
import ScheduleList from "./ScheduleList"
import ContentForm from "@/_components/common/ContentForm"

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) return <div>User not authenticated</div>

  const schedules = await prisma.schedule.findMany({
    where: {
      users: {
        some: { userId: user.id }
      }
    },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      frequency: true,
      startDate: true,
      startTime: true,
      endDate: true,
      endTime: true
    }
  })

  return (
    <ContentForm>
      <ContentForm.Body>
        <ScheduleList schedules={schedules} />
      </ContentForm.Body>
    </ContentForm>
  )
}
