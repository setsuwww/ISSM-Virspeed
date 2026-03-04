import '@/_styles/employee.css'
import '@/_styles/utilities.css'

export const metadata ={
  title: "Employee | Profiles",
  description: "Employee's personal profile",
};

import { DashboardHeader } from '../DashboardHeader';

export default async function DashboardLayout({ children }) {
  return (
    <div>
        <DashboardHeader title="Your Profile" subtitle="See your private information here"/>
        {children}
    </div>
  );
}
