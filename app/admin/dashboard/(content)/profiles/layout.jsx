import '@/_styles/admin.css'
import '@/_styles/utilities.css'

export const metadata = {
  title: "Admin | Profiles",
  description: "Admin's personal profile",
};

import ProfileTabs from './(tabs)/ProfileTabs';
import { DashboardHeader } from '../../DashboardHeader';

export default async function DashboardLayout({ children }) {
  return (
    <div>
        <DashboardHeader title="Your Profile" subtitle="See your private information here"/>
        <ProfileTabs />
        {children}
    </div>
  );
}
