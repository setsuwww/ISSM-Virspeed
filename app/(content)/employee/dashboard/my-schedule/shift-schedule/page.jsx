import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/_lib/auth'
import { prisma } from '@/_lib/prisma'
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns'
import ContentForm from '@/_components/common/ContentForm'
import { ContentInformation } from '@/_components/common/ContentInformation'
import ScheduleToEvent from '../ScheduleToEvent'
import ShiftList from './ShiftList'

export const revalidate = 0

export default async function MySchedulePage(props) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  const selectedMonth = searchParams?.month || format(new Date(), 'yyyy-MM')

  let targetDate
  try {
    targetDate = parseISO(`${selectedMonth}-01`)
    if (isNaN(targetDate.getTime())) throw new Error()
  } catch (e) {
    targetDate = new Date()
  }

  const start = startOfMonth(targetDate)
  const end = endOfMonth(targetDate)

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
            selectedMonth={format(targetDate, 'yyyy-MM')}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
