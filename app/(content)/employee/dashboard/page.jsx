import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/employee/dashboard/attendance/main')
}
