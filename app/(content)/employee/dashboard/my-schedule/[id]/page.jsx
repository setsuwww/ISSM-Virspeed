import { prisma } from "@/_lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"

import ScheduleListDetails from "./ScheduleListDetails"

export default async function Page({ params }) {
  const id = Number(params.id)

  if (!id || Number.isNaN(id)) return notFound()

  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!schedule) return notFound()

  const viewModel = {
    id: schedule.id,
    title: schedule.title,
    description: schedule.description ?? "-",
    frequency: schedule.frequency,

    dateRange: {
      start: schedule.startDate
        ? format(schedule.startDate, "dd MMMM yyyy")
        : "-",
      end: schedule.endDate
        ? format(schedule.endDate, "dd MMMM yyyy")
        : "-",
    },

    timeRange: {
      start: schedule.startTime ?? "-",
      end: schedule.endTime ?? "-",
    },

    users: schedule.users.map(({ user }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      initial: user.name.charAt(0),
    })),
  }

  return <ScheduleListDetails schedule={viewModel} />
}
