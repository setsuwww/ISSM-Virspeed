import '@/_styles/admin.css'
import '@/_styles/utilities.css'

export const metadata = {
  title: "Admin | Dashboard",
  description: "Admin Content",
};

import { ReactQueryProvider } from '@/_contexts/Query-Provider';
import { ToastProvider } from '@/_contexts/Toast-Provider';
import { ConfirmDialog } from "@/_components/ui/Confirm";

import SidebarBase from '@/_components/common/sidebar/SidebarBase';
import { adminMenu } from '@/_components/common/sidebar/content/admin.menu';

import { getCurrentUser } from '@/_lib/auth';
import PageTransition from './page-transition';

export default async function DashboardLayout({ children }) {

  const user = await getCurrentUser()

  return (
    <div className="flex h-screen">
      <SidebarBase menu={adminMenu} user={user} />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto px-8 py-3.5 bg-slate-100">
          <ReactQueryProvider>
            <ToastProvider><ConfirmDialog />

              <PageTransition>
                {children}
              </PageTransition>

            </ToastProvider>
          </ReactQueryProvider>
        </main>
      </div>
    </div>
  );
}
