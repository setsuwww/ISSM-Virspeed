import { getCurrentUser } from "@/_lib/auth"
import { prisma } from "@/_lib/prisma"
import ContentForm from "@/_components/common/ContentForm"
import ScheduleList from "./ScheduleList"
import { ContentInformation } from "@/_components/common/ContentInformation"

export const revalidate = 60

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) {
    return <div className="p-6 text-slate-500">User not authenticated</div>
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      users: {
        some: { userId: user.id },
      },
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
      endTime: true,

      users: {
        take: 5,
        orderBy: { id: "asc" },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      _count: {
        select: {
          users: true,
        },
      },
    },
  })

  const normalizedSchedules = schedules.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    frequency: s.frequency,
    startDate: s.startDate,
    startTime: s.startTime,
    endDate: s.endDate,
    endTime: s.endTime,

    usersPreview: s.users.map((u) => u.user),
    totalUsers: s._count.users,
    hasMoreUsers: s._count.users > s.users.length,
  }))

  return (
    <ContentForm>
      <ContentForm.Header>
        <ContentInformation heading="My Schedule" subheading="List of my schedules" />
      </ContentForm.Header>
      <ContentForm.Body>
        <ScheduleList schedules={normalizedSchedules} />
      </ContentForm.Body>
    </ContentForm>
  )
}
