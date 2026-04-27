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

import { typeOptions, statusOptions } from "@/_components/_constants/locationConstants";
import { minutesToTime, capitalize } from "@/_functions/globalFunction";

import { updateLocation } from "@/_servers/admin-services/location_action";
import { useToast } from "@/_clients/_contexts/Toast-Provider";

export default function EditLocationForm({ location }) {
  const router = useRouter();
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData) {
    const data = Object.fromEntries(formData.entries());

    startTransition(async () => {
      const res = await updateLocation(location.id, data);

      if (res && res.success === false) {
        addToast({
          title: "Update failed",
          description: res.message || `Location "${location.name}" fail to change`,
        })
        return;
      }

      addToast({
        title: "Status updated",
        description: `Location "${location.name}" status successfully changed.`,
      })
      router.push("/admin/dashboard/users/locations");
    });
  }

  return (
    <ContentForm>
      <form action={handleSubmit} className="space-y-2">
        <ContentForm.Header>
          <ContentInformation title="Edit Location" subtitle={`Editing data for: ${location.name}`}
            show variant="outline" buttonText="Cancel" buttonIcon={<ChevronLeft />} href="/admin/dashboard/users/locations"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input name="name" defaultValue={location.name} required />
            </div>

            <div className="space-y-2">
              <Label>Location <span className="text-red-500">*</span></Label>
              <Input name="location" defaultValue={location.location} required />
            </div>

            <ContentInformation title="Location Coordinates" subtitle="Insert latitude and longitude for active location location" />

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="space-y-2">
                <Label>Longitude<span className="text-red-500">*</span></Label>
                <Input name="longitude" defaultValue={location.longitude ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Latitude<span className="text-red-500">*</span></Label>
                <Input name="latitude" defaultValue={location.latitude ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Radius (meter)<span className="text-red-500">*</span></Label>
              <Input name="radius" defaultValue={location.radius ?? ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time <span className="text-red-500">*</span></Label>
                <Input
                  type="time"
                  name="startTime"
                  defaultValue={location.startTime ? minutesToTime(location.startTime) : ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Time <span className="text-red-500">*</span></Label>
                <Input
                  type="time"
                  name="endTime"
                  defaultValue={location.endTime ? minutesToTime(location.endTime) : ""}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type<span className="text-red-500">*</span></Label>
                <Select name="type" defaultValue={location.type}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status<span className="text-red-500">*</span></Label>
                <Select name="status" defaultValue={location.status}>
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
              "Update Location"
            )}
          </Button>
        </ContentForm.Footer>
      </form>
    </ContentForm>
  );
}
