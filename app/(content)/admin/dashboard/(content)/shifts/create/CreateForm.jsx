"use client";

import { useState } from "react";
import { ChevronLeft, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Label } from "@/_components/ui/Label";
import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";

import { timeToMinutes } from "@/_functions/globalFunction";
import { capitalize } from "@/_functions/globalFunction";

import { createShift } from "@/_servers/admin-action/shiftAction"

export default function CreateShiftForm({ locations }) {
  const router = useRouter();

  const [type, setType] = useState("MORNING");
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationId, setLocationId] = useState("NONE");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (locationId === "NONE") {
      alert("Please select an location for this shift!");
      return;
    }

    const payload = {
      type, name,
      startTime: timeToMinutes(startTime),
      endTime: timeToMinutes(endTime),
      locationId: parseInt(locationId),
    };

    try {
      setLoading(true);
      await createShift(payload);
      router.push("/admin/dashboard/shifts");
    }
    finally { setLoading(false) }
  };

  return (
    <section>
      <DashboardHeader title="Create Shift" subtitle="Assign a shift to an location" />

      <ContentForm>
        <form onSubmit={handleSubmit} className="space-y-0">
          <ContentForm.Header>
            <ContentInformation title="Shift Form" subtitle="Create a new shift and assign it to an location"
              show={true} buttonText="Back" buttonIcon={<ChevronLeft />} variant="outline" href="/admin/dashboard/shifts"
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
                    <SelectValue placeholder="Select an location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {capitalize(location.name)}
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
                  <Input id="shift-name" value={name} onChange={(e) => setName(e.target.value)} type="text"
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
                  <Input id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} type="time"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="end-time">
                    End Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input id="end-time" value={endTime} onChange={(e) => setEndTime(e.target.value)} type="time"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>
          </ContentForm.Body>

          <ContentForm.Footer>
            <Button type="submit" disabled={loading}>
              {loading
                ? (<><Loader className="w-4 h-4 animate-spin" /> Creating...</>)
                : "Create Shift"
              }
            </Button>
          </ContentForm.Footer>
        </form>
      </ContentForm>
    </section>
  );
}
