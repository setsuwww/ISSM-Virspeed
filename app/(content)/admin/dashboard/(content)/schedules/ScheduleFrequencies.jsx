"use client"

import { useRouter } from 'next/navigation'

import { ContentInformation } from '@/_components/common/ContentInformation'
import { frequenciesLabel } from '@/_components/_constants/scheduleConstants'
import { SquarePlus, Tag } from 'lucide-react'
import { Button } from '@/_components/ui/Button'

export default function ScheduleFrequencies() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <ContentInformation title="Schedule table" subtitle="Manage schedule more detail than calendar view" />
        <div className="flex items-center space-x-2 mt-4 mb-4">
          {frequenciesLabel.map((f) => (
            <div key={f.label} className={`${f.color} flex items-center space-x-2 border px-2 py-0.5 rounded-full`}>
              <Tag strokeWidth={2} className={`w-3 h-3`} />
              <span className={`text-sm font-base`}>
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Button variant="primary" onClick={() => router.push("/admin/dashboard/schedules/create")}>
          <SquarePlus />
          Create Schedule
        </Button>
      </div>
    </div>
  )
}
