"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import { RadioButton } from "@/_components/ui/RadioButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Label } from "@/_components/ui/Label";
import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import { capitalize } from "@/_functions/globalFunction";
import { roleOptions } from "@/_constants/userConstants";
import { updateUser } from "@/_servers/admin-action/userAction.js";
import { ChevronLeft, Loader } from 'lucide-react';

export default function EditForm({ user, locations }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    id: user.id, name: user.name, email: user.email,
    password: "", role: user.role,
    locationId: user.locationId ? String(user.locationId) : "",
    shiftId: user.shiftId ? String(user.shiftId) : "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateUser(form);
      if (result?.success) { router.push("/admin/dashboard/users") }
      else { alert(result?.error) }
    });
  }

  const selectedLocation = locations.find((o) => String(o.id) === form.locationId);
  const availableShifts = selectedLocation?.shifts || [];

  return (
    <section>
      <DashboardHeader
        title="Edit User"
        subtitle="Update user details including name, email, role, and assignment"
      />

      <ContentForm>
        <form onSubmit={handleSubmit} className="space-y-2">
          <ContentForm.Header>
            <ContentInformation title="Public" subtitle="Update user info" show={true} buttonText="Cancel" buttonIcon={<ChevronLeft />} variant="outline" href="/admin/dashboard/users/employees/shift-employees" />
          </ContentForm.Header>

          <ContentForm.Body>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>

              <ContentInformation title="Private" subtitle="Password & Role" />

              <div className="space-y-2 mt-6">
                <Label>Password</Label>
                <Input type="password" name="password" value={form.password}
                  placeholder="Leave blank to keep current"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <RadioButton name="role" options={roleOptions}
                  value={form.role} onChange={(v) => handleCustomChange("role", v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Location Assignment</Label>
                <Select value={form.locationId} onValueChange={(v) => handleCustomChange("locationId", v)}>
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder="Select an location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {capitalize(o.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Shift Assignment</Label>
                <Select value={form.shiftId} onValueChange={(v) => handleCustomChange("shiftId", v)} disabled={availableShifts.length === 0}>
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder={availableShifts.length === 0 ? "No shifts found" : "Select a Shift"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableShifts.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {capitalize(s.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ContentForm.Body>

          <ContentForm.Footer>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? (<><Loader className="w-4 h-4 animate-spin" /> Updating...</>)
                : "Update User"
              }
            </Button>
          </ContentForm.Footer>
        </form>
      </ContentForm>
    </section>
  );
}
