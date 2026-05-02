import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/_lib/auth'
import { prisma } from '@/_lib/prisma'
import ContentForm from '@/_components/common/ContentForm'
import { ContentInformation } from '@/_components/common/ContentInformation'
import ScheduleToEvent from '../ScheduleToEvent'
import ShiftList from './ShiftList'

export const revalidate = 0

import {
  getNowJakarta,
  parseJakarta,
  formatJakarta
} from "@/_lib/time"

export default async function MySchedulePage(props) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  const nowJakarta = getNowJakarta()
  const selectedMonth = searchParams?.month || nowJakarta.format("YYYY-MM")

  let targetDate
  try {
    targetDate = parseJakarta(selectedMonth + "-01")
    if (!targetDate.isValid()) throw new Error()
  } catch (e) {
    targetDate = nowJakarta
  }

  const start = targetDate.clone().startOf("month").toDate()
  const end = targetDate.clone().endOf("month").toDate()

  console.log(`[DEBUG-MY-SCHEDULE] User ${user.id} Fetch Range: ${start.toISOString()} to ${end.toISOString()}`)

  const assignments = await prisma.shiftAssignment.findMany({
    where: {
      userId: user.id,
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      shift: true
    },
    orderBy: { date: 'asc' }
  })

  return (
    <section>
      <ContentForm>
        <ContentForm.Header>
          <div className="flex items-center justify-between">
            <ContentInformation title="Shift Schedules" subtitle="Manage your shift schedules" />
            <ScheduleToEvent />
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <ShiftList
            assignments={assignments}
            selectedMonth={formatJakarta(targetDate, 'YYYY-MM')}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
