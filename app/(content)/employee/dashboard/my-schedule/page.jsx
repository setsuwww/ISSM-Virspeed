import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/_lib/auth'
import { prisma } from '@/_lib/prisma'
import ShiftScheduleClient from './ShiftScheduleClient'
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns'

export const revalidate = 0

export default async function MySchedulePage(props) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')

  // Parse selected month from searchParams or default to current month
  const selectedMonth = searchParams?.month || format(new Date(), 'yyyy-MM')
  
  // Create a proper date from "yyyy-MM" to find the start and end of that month
  // "yyyy-MM-01" is used to parse a valid Date
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
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-slate-800">My Shift Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">View your shift assignments for the selected month.</p>
      </div>
      
      <ShiftScheduleClient 
        assignments={assignments} 
        selectedMonth={format(targetDate, 'yyyy-MM')} 
      />
    </div>
  )
}
