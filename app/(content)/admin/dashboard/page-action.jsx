"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/_components/ui/Button";
import { Plus, Eye, Search } from "lucide-react";

export default function FastActions() {
  const router = useRouter();
  const [searchUrl, setSearchUrl] = useState("");

  const actions = [
    {
      label: "Users",
      hrefView: "/admin/dashboard/users",
      hrefCreate: "/admin/dashboard/users/create",
    },
    {
      label: "Shifts",
      hrefView: "/admin/dashboard/shifts",
      hrefCreate: "/admin/dashboard/shifts/create",
    },
    {
      label: "Schedules",
      hrefView: "/admin/dashboard/schedules",
      hrefCreate: "/admin/dashboard/schedules/create",
    },
    {
      label: "Locations",
      hrefView: "/admin/dashboard/users/locations",
      hrefCreate: "/admin/dashboard/users/locations/create",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchUrl.trim()) return;
    router.push(searchUrl.startsWith("/") ? searchUrl : `/${searchUrl}`);
    setSearchUrl("");
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <div key={action.label} className="flex items-center">
            <Link href={action.hrefView}>
              <Button variant="outline" className="bg-white hover:bg-slate-100/70 border-slate-200 flex items-center gap-2 rounded-r-none text-sm">
                <Eye className="text-sky-500 w-4 h-4" />
                <span className="text-slate-600">View {action.label}</span>
              </Button>
            </Link>
            <Link href={action.hrefCreate}>
              <Button variant="outline" className="bg-white hover:bg-slate-100/70 border-slate-200 rounded-l-none border-l-0">
                <Plus className="w-4 h-4 text-slate-400" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg pl-3 pr-0.5 py-1 focus:caret-sky-300 focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-100 transition-colors">
        <Search className="text-gray-400 w-4 h-4 group-focus-within:text-sky-500 transition-colors" />
        <input type="text" placeholder="Search Url..."
          value={searchUrl} onChange={(e) => setSearchUrl(e.target.value)}
          className="outline-none text-sm w-[17rem] bg-transparent py-1 rounded-lg"
        />
        <Button type="submit" className="hidden text-xs bg-sky-500 hover:bg-sky-600 text-white py-2">
          Search
        </Button>
      </form>
    </div>
  );
}
