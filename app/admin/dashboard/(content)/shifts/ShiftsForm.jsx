"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader } from "lucide-react"

import { Button } from "@/_components/ui/Button"
import { Input } from "@/_components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { Label } from "@/_components/ui/Label"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"

import { timeToMinutes } from "@/_function/globalFunction"
import { capitalize } from "@/_function/globalFunction"
import { createShift, updateShift } from "@/_server/admin-action/shiftAction"

export default function ShiftForm({ divisions, shift }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isEdit = Boolean(shift)

  const [type, setType] = useState(shift?.type ?? "MORNING")
  const [name, setName] = useState(shift?.name ?? "")
  const [startTime, setStartTime] = useState(shift?.startTime ?? "")
  const [endTime, setEndTime] = useState(shift?.endTime ?? "")
  const [divisionId, setDivisionId] = useState(
    shift?.divisionId ? String(shift.divisionId) : "NONE"
  )

  const handleSubmit = (e) => {
    e.preventDefault()

    if (divisionId === "NONE") {
      alert("Please select a division")
      return
    }

    const payload = {
      type,
      name,
      startTime: timeToMinutes(startTime),
      endTime: timeToMinutes(endTime),
      divisionId: Number(divisionId),
    }

    startTransition(async () => {
      const res = isEdit
        ? await updateShift(shift.id, payload)
        : await createShift(payload)

      if (res?.error) {
        alert(res.error)
        return
      }

      router.push("/admin/dashboard/shifts")
    })
  }

  return (
    <section>
      <DashboardHeader
        title={isEdit ? "Edit Shift" : "Create Shift"}
        subtitle="Assign a shift to a division"
      />

      <ContentForm>
        <form onSubmit={handleSubmit}>
          <ContentForm.Header>
            <ContentInformation
              heading="Shift Form"
              subheading={isEdit ? "Update shift data" : "Create a new shift"}
              show
              buttonText="Back"
              variant="outline"
              href="/admin/dashboard/shifts"
            />
          </ContentForm.Header>

          <ContentForm.Body>
            <div className="space-y-4">

              {/* Division */}
              <div>
                <Label>Division *</Label>
                <Select value={divisionId} onValueChange={setDivisionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-</SelectItem>
                    {divisions.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {capitalize(d.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type & Name */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Shift Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning</SelectItem>
                      <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                      <SelectItem value="EVENING">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label>Shift Name *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Start Time *</Label>
                  <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
                <div className="flex-1">
                  <Label>End Time *</Label>
                  <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
              </div>

            </div>
          </ContentForm.Body>

          <ContentForm.Footer>
            <Button type="submit" disabled={isPending}>
                {isPending 
                    ? (<><Loader className="w-4 h-4 animate-spin mr-2" />{isEdit ? "Saving..." : "Creating..."}</>) 
                    : (isEdit ? "Update Shift" : "Create Shift")
                }
            </Button>
          </ContentForm.Footer>
        </form>
      </ContentForm>
    </section>
  )
}
