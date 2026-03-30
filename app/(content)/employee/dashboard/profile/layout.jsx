import '@/_styles/utilities.css'

export const metadata ={
  title: "Employee | Profiles",
  description: "Employee's personal profile",
};


export default async function DashboardLayout({ children }) {
  return (
    <div>
        {children}
    </div>
  );
}
