import { notFound } from "next/navigation"
import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import EditForm from "./EditForm"

export default async function Page({ params }) {
  const { id } = params
  const user = await getCurrentUser()
  if (!user) return <div>Unauthorized</div>

  const schedule = await prisma.schedule.findFirst({
    where: { id: Number(id),
      users: { some: { userId: user.id } },
    },
    include: { users: { include: { user: true } }},
  })

  if (!schedule) return notFound()

  const [users, shifts] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, role: true, email: true },
      orderBy: { id: "asc" },
    }),
    prisma.shift.findMany({ select: { id: true, name: true }}),
  ])

  const formatDate = (date) => (date ? date.toISOString().split("T")[0] : "")
  const { id: scheduleId, title, description, frequency, startTime, endTime } = schedule

  const formData = {
    id: scheduleId, title, description, frequency,
    startDate: formatDate(schedule.startDate), startTime: startTime ?? "",
    endDate: formatDate(schedule.endDate), endTime: endTime ?? "",
    users: schedule.users.map(({ user }) => user),
  }

  return <EditForm schedule={formData} users={users} shifts={shifts} />
}
