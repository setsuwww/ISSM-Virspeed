"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";
import { Button } from "@/_components/ui/Button";
import { Badge } from "@/_components/ui/Badge";

import { capitalize } from "@/_function/globalFunction";
import { apiFetchData } from "@/_lib/fetch";
import { shiftStyles, shiftIcons } from "@/_constants/shiftConstants";
import { UserCircle } from "phosphor-react";

export function ShiftsView({ data }) {
  const router = useRouter();

  const handleEdit = (id) => router.push(`/admin/dashboard/shifts/${id}/edit`);

  const handleDelete = async (id) => {
    try { await apiFetchData({ url: `/shifts/${id}`, method: "delete",
        successMessage: "Shift deleted successfully",
        errorMessage: "Failed to delete shift",
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Time Range</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((shift) => (
            <TableRow key={shift.id}>
              <TableCell className="font-semibold text-slate-700">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${shiftStyles[shift.type]}`}>
                    {shiftIcons[shift.type]}
                  </div>
                  <span>{shift.name}</span>
                </div>
              </TableCell>

              <TableCell className="text-slate-600">
                <Badge className={shiftStyles[shift.type]}>
                  {capitalize(shift.type)}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className="text-slate-600 border-slate-300">
                  {shift.timeRange}
                </Badge>
              </TableCell>

              <TableCell className="text-slate-700">
                {shift.division}
              </TableCell>

              <TableCell>
                <Link href={`/admin/dashboard/shifts/${shift.id}/users`} className="flex items-center space-x-1 text-sky-500">
                  <UserCircle strokeWidth={1} size={24} color="#00bcff" weight="duotone" /> <span>{shift.usersCount} Users</span>
                </Link>
              </TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(shift.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(shift.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
