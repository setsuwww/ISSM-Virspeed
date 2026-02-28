import React from 'react'
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Label } from "@/_components/ui/Label";

export default function LinkToPage() {
  return (
    <div className='flex items-center space-x-2 pb-2'>
      <Label className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 w-fit">
        See :
      </Label>
      <Link
        href="/admin/dashboard/shifts"
        className="inline-flex items-center gap-1 text-sm font-semibold bg-blue-100 px-3 py-0.5 rounded-full text-blue-600 hover:bg-blue-200 transition-colors w-fit"
      >
        Shift Details
        <ChevronRight size={18} strokeWidth={2} />
      </Link>
      <Link
        href="/admin/dashboard/users"
        className="inline-flex items-center gap-1 text-sm font-semibold bg-blue-100 px-3 py-0.5 rounded-full text-blue-600 hover:bg-blue-200 transition-colors w-fit"
      >
        Users Details
        <ChevronRight size={18} strokeWidth={2} />
      </Link>
      <Link
        href="/admin/dashboard/users/employees/shift-employees"
        className="inline-flex items-center gap-1 text-sm font-semibold bg-blue-100 px-3 py-0.5 rounded-full text-blue-600 hover:bg-blue-200 transition-colors w-fit"
      >
        Employees Details
        <ChevronRight size={18} strokeWidth={2} />
      </Link>
    </div>
  )
}
