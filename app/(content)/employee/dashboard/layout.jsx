import '@/_styles/employees.css'

export const metadata = {
  title: "Employee | Dashboard",
  description: "Employee content"
};

import SidebarBase from "@/_components/common/sidebar/SidebarBase";
import { employeeMenu } from "@/_components/common/sidebar/content/employee.menu";

import { getCurrentUser } from "@/_lib/auth";
import { getScheduleCount } from "@/_jobs/partials/getScheduleCount";
import { getChangeShiftCount } from '@/_jobs/partials/getChangeShiftCount';
import DashboardHeader from './DashboardHeader';
import { ToastProvider } from '@/_clients/_contexts/Toast-Provider';
import { ConfirmDialog } from '@/_components/ui/Confirm';

export default async function DashboardLayout({ children }) {

  const scheduleCount = await getScheduleCount()
  const csCount = await getChangeShiftCount()
  const user = await getCurrentUser()

  return (
    <div className="flex h-screen">
      <SidebarBase menu={employeeMenu(csCount, scheduleCount)} user={user} />

      <div className="flex-1 flex flex-col">
        <ToastProvider><ConfirmDialog />
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
            {children}
          </main>
        </ToastProvider>
      </div>
    </div>
  )
}
