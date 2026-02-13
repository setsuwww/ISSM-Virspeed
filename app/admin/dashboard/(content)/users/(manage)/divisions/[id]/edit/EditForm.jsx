"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { Label } from "@/_components/ui/Label";
import { ChevronLeft, Loader } from "lucide-react";

import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";

import { typeOptions, statusOptions } from "@/_constants/divisionConstants";
import { minutesToTime, capitalize } from "@/_function/globalFunction";

import { updateDivision } from "@/_server/admin-action/divisionAction";
import { useToast } from "@/_context/Toast-Provider";

export default function EditDivisionForm({ division }) {
  const router = useRouter();
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData) {
    const data = Object.fromEntries(formData.entries());

    startTransition(async () => {
      const res = await updateDivision(division.id, data);
      if (res?.success) {
        addToast({
          title: "Status updated",
          description: `Division "${division.name}" status successfully changed.`,
        })
        router.push("/admin/dashboard/users/divisions");
      }
      else {
        addToast({
          title: "Update failed",
          description: `Division "${division.name}" fail to change`,
        })
      }
    });
  }

  return (
    <ContentForm>
      <form action={handleSubmit} className="space-y-2">
        <ContentForm.Header>
          <ContentInformation heading="Edit Division" subheading={`Editing data for: ${division.name}`}
            show variant="outline" buttonText="Cancel" buttonIcon={<ChevronLeft />} href="/admin/dashboard/users/divisions"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Name <span className="text-rose-500">*</span></Label>
              <Input name="name" defaultValue={division.name} required />
            </div>

            <div className="space-y-2">
              <Label>Location <span className="text-rose-500">*</span></Label>
              <Input name="location" defaultValue={division.location} required />
            </div>

            <ContentInformation
              heading="Division Coordinates"
              subheading="Insert latitude and longitude for active division location"
            />

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="space-y-2">
                <Label>Longitude<span className="text-rose-500">*</span></Label>
                <Input name="longitude" defaultValue={division.longitude ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Latitude<span className="text-rose-500">*</span></Label>
                <Input name="latitude" defaultValue={division.latitude ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Radius (meter)<span className="text-rose-500">*</span></Label>
              <Input name="radius" defaultValue={division.radius ?? ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time <span className="text-rose-500">*</span></Label>
                <Input
                  type="time"
                  name="startTime"
                  defaultValue={division.startTime ? minutesToTime(division.startTime) : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Time <span className="text-rose-500">*</span></Label>
                <Input
                  type="time"
                  name="endTime"
                  defaultValue={division.endTime ? minutesToTime(division.endTime) : ""}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type<span className="text-rose-500">*</span></Label>
                <Select name="type" defaultValue={division.type}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status<span className="text-rose-500">*</span></Label>
                <Select name="status" defaultValue={division.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {capitalize(opt.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </ContentForm.Body>

        <ContentForm.Footer>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Division"
            )}
          </Button>
        </ContentForm.Footer>
      </form>
    </ContentForm>
  );
}
