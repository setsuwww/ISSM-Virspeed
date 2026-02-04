"use client"

import { useRouter } from 'next/navigation'

import { ContentInformation } from '@/_components/common/ContentInformation'
import { frequenciesLabel } from '@/_constants/scheduleConstants'
import { Tag } from 'lucide-react'
import { Button } from '@/_components/ui/Button'

export default function ScheduleFrequencies() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <ContentInformation heading="Schedule table" subheading="Manage schedule more detail than calendar view" />
        <div className="flex items-center space-x-2 mt-4 mb-4">
          {frequenciesLabel.map((f) => (
            <div key={f.label} className={`flex items-center space-x-2 border border-${f.color}-100 px-2 py-0.5 rounded-full`}>
              <Tag strokeWidth={2} className={`w-3 h-3 text-${f.color}-500`} />
              <span className={`text-${f.color}-600 text-sm font-base`}>
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Button variant="primary" onClick={() => router.push("/admin/dashboard/schedules/create")}>Create Schedule</Button>
      </div>
    </div>
  )
}
