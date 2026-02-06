import React from "react";
import { Layers, ShieldCheck } from "lucide-react";

export default function AppInformation() {
  return (
    <section className="mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">
            <span className="text-yellow-500">Bee</span>fast.
          </h1>
          <p className="text-sm text-gray-500">
            Information System Shift Management
          </p>
        </div>
      </div>

      {/* App Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard label="Version" value="0.1 Velizuia" />
        <InfoCard label="Environment" value="Production" />
        <InfoCard label="Release Date" value="10 Agustus 2025" />
        <InfoCard label="License" value="Proprietary" />
      </div>

      {/* Description */}
      <Card title="About this system" icon={<ShieldCheck className="h-5 w-5" />} iconParentUI="p-1.5 rounded-lg bg-sky-100 text-sky-700">
        <p className="max-w-md text-sm text-gray-600 leading-relaxed">
          Beefast is an internal application used to manage
          operational shift, user and attendance systems in a centralized, accurate,
          safe, and structured, providing maximum performance for a better experience.
        </p>
      </Card>

      {/* Features */}
      <Card title="Main Function" icon={<Layers className="h-5 w-5" />} iconParentUI="p-1.5 rounded-lg bg-sky-100 text-sky-700">
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Manage users, employees, and shift</li>
          <li>Report detail and accurate</li>
          <li>Makes it easy for users to record data</li>
          <li>Shorten the time in searching for data</li>
        </ul>
      </Card>

      <div className="mb-2 pt-5 border-t text-center text-sm text-gray-500">
        <span className="block mb-2">
          This software is proprietary and confidential.
          Unauthorized copying, modification, or distribution is prohibited.
        </span>

        © 2026 Beefast. All rights reserved.
      </div>
    </section>
  );
}

function Card({
  title,
  icon,
  iconParentUI = "bg-gray-100 text-gray-600",
  children,
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-gray-800 font-semibold">
        <div className={iconParentUI}>
          {icon}
        </div>
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-lg font-semibold text-gray-600">
        {value}
      </p>
    </div>
  );
}
