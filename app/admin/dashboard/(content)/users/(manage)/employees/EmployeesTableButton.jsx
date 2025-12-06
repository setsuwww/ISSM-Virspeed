"use client"

import { useRouter } from 'next/navigation';
import { Button } from '@/_components/ui/Button';

export default function EmployeesTableButton() {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={() => router.push("/admin/dashboard/users/attendances")}>Attendance</Button>
        <Button variant="primary" onClick={() => router.push("/admin/dashboard/users/create")}>Add Employees</Button>
    </div>
  )
}
