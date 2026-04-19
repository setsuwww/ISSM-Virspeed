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

import { timeToMinutes, minutesToTime } from "@/_functions/globalFunction";

import { updateShift } from "@/_servers/admin-services/shift_action";
import { useToast } from "@/_contexts/Toast-Provider";

export default function EditShiftForm({ shift, locations }) {
  const router = useRouter();
  const { addToast } = useToast();

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
  const [locationId, setLocationId] = useState(String(shift?.locationId || "NONE"));
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
      setLocationId(String(shift.locationId || "NONE"));
    }
  }, [shift]);

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (locationId === "NONE") {
      addToast("Please select a location for this shift!", { type: "warning" })
      return
    }

    try {
      setLoading(true)
      const res = await updateShift(shift.id, {
        type, name,
        startTime: timeToMinutes(startTime),
        endTime: timeToMinutes(endTime),
        locationId: parseInt(locationId),
      })

      if (res?.error) {
        addToast(res.error, { type: "error" });
        return;
      }

      addToast("Shift updated successfully", { type: "success" });

      router.push("/admin/dashboard/shifts")
    }
    finally { setLoading(false) }
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
                <Label htmlFor="location-select">
                  Location <span className="text-rose-500">*</span>
                </Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger id="location-select" className="w-full mt-1">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name}
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
