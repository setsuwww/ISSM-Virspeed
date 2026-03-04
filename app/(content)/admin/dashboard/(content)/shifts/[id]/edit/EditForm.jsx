"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Label } from "@/_components/ui/Label";
import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";

import { timeToMinutes, minutesToTime, capitalize } from "@/_functions/globalFunction";

import { updateShift } from "@/_servers/admin-action/shiftAction";

export default function EditShiftForm({ shift, divisions }) {
  const router = useRouter();

  const [type, setType] = useState(shift?.type || "MORNING");
  const [name, setName] = useState(shift?.name || "");
  const [startTime, setStartTime] = useState(
    shift?.startTime !== null && shift?.startTime !== undefined
      ? minutesToTime(shift.startTime)
      : ""
  )
  const [endTime, setEndTime] = useState(
    shift?.endTime !== null && shift?.endTime !== undefined
      ? minutesToTime(shift.endTime)
      : ""
  )
  const [divisionId, setDivisionId] = useState(String(shift?.divisionId || "NONE"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shift) {
      setType(shift.type || "MORNING");
      setName(shift.name || "");
      setStartTime(
        shift.startTime !== null && shift.startTime !== undefined
          ? minutesToTime(shift.startTime)
          : ""
      )
      setEndTime(
        shift.endTime !== null && shift.endTime !== undefined
          ? minutesToTime(shift.endTime)
          : ""
      )
      setDivisionId(String(shift.divisionId || "NONE"));
    }
  }, [shift]);

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (divisionId === "NONE") {
      alert("Please select a division for this shift!")
      return
    }

    try { setLoading(true)
      await updateShift(shift.id, {
        type, name,
        startTime: timeToMinutes(startTime),
        endTime: timeToMinutes(endTime),
        divisionId: parseInt(divisionId),
      })

      router.push("/admin/dashboard/shifts")
    }
    finally { setLoading(false)}
  }

  return (
    <section>
      <DashboardHeader
        title="Edit Shift"
        subtitle="Update the shift information"
      />

      <ContentForm>
        <form onSubmit={handleSubmit} className="space-y-0">
          <ContentForm.Header>
            <ContentInformation title="Edit Shift" subtitle={`Modify the details of shift "${shift?.name || ""}"`}
              show={true} buttonText="Cancel" buttonIcon={<ChevronLeft />} variant="outline" href="/admin/dashboard/shifts"
            />
          </ContentForm.Header>

          <ContentForm.Body>
            <div className="flex flex-col space-y-0">
              <div className="space-y-2">
                <Label htmlFor="division-select">
                  Division <span className="text-rose-500">*</span>
                </Label>
                <Select value={divisionId} onValueChange={setDivisionId}>
                  <SelectTrigger id="division-select" className="w-full mt-1">
                    <SelectValue placeholder="Select a division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-</SelectItem>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={String(division.id)}>
                        {capitalize(division.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4 mt-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="shift-type">Shift Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="shift-type" className="w-full mt-1">
                      <SelectValue placeholder="Select shift type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning</SelectItem>
                      <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                      <SelectItem value="EVENING">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="shift-name">
                    Shift Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="shift-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Example: Morning Shift"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="start-time">
                    Start Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    type="time"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="end-time">
                    End Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    type="time"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>
          </ContentForm.Body>

          <ContentForm.Footer>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Shift"
              )}
            </Button>
          </ContentForm.Footer>
        </form>
      </ContentForm>
    </section>
  );
}
