"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound, Trash2, FolderInput, RefreshCcw, Building2 } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { Checkbox } from "@/_components/ui/Checkbox";
import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import EmptyStates from "@/_components/common/EmptyStates";

import { roleStyles } from "@/_constants/roleConstants";
import { capitalize } from "@/_function/globalFunction";
import { EmployeesSwitchModal } from "../../../users/(manage)/employees/EmployeesSwitchModal";

import { deleteUsers, deleteUserById } from "@/_server/admin-action/userAction";

export default function UserShiftTable({ data }) {
  const router = useRouter();

  const [users, setUsers] = useState(data);

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    setUsers(data);
  }, [data]);

  const filteredData = useMemo(() => {
    let result = [...users];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (sortOrder === "A-Z") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "Z-A") result.sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [users, search, sortOrder]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(
      selectedIds.length === filteredData.length
        ? []
        : filteredData.map((u) => u.id)
    );
  }, [filteredData, selectedIds]);

  const handleEditUser = useCallback(
    (id) => router.push(`/admin/users/${id}/edit`),
    [router]
  );

  const handleDeleteUser = useCallback(
    async (id) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));

      try {
        await deleteUserById(id);
      } catch {
        router.refresh();
      }
    },
    [router]
  );

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedIds.length) return;

    setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
    setSelectedIds([]);

    try {
      await deleteUsers(selectedIds);
    } catch {
      router.refresh();
    }
  }, [selectedIds, router]);

  const handleDeleteAll = useCallback(async () => {
    if (!filteredData.length) return;

    const ids = filteredData.map((u) => u.id);

    setUsers([]);
    setSelectedIds([]);

    try {
      await deleteUsers(ids);
    } catch {
      router.refresh();
    }
  }, [filteredData, router]);

  const handleSwapShift = (userId) => {
    setCurrentUserId(userId);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-auto px-3">
              <span className="font-semibold text-slate-600 mr-1">Filter:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Default</SelectItem>
              <SelectItem value="A-Z">A - Z</SelectItem>
              <SelectItem value="Z-A">Z - A</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            typeSearch
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-rose-500"
            disabled={!selectedIds.length}
            onClick={handleDeleteSelected}
          >
            Delete Selected
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="bg-rose-50 text-rose-500 hover:bg-rose-100"
            onClick={handleDeleteAll}
          >
            <Trash2 size={18} />
            Delete All
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="bg-teal-100 text-teal-600 hover:bg-teal-200"
          >
            <FolderInput size={16} />
            Export
          </Button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <EmptyStates />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === filteredData.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Created / Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={() => toggleSelect(user.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-200 rounded-full">
                      <CircleUserRound className="text-slate-500" />
                    </div>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span className={`text-sm font-medium px-2 border rounded-md ${roleStyles[capitalize(user.role)] ?? ""}`}>
                    {capitalize(user.role)}
                  </span>
                </TableCell>

                <TableCell>
                  <div>
                    <div className="font-semibold">{user.divisionName}</div>
                    <div className="text-xs text-slate-400">
                      {user.startTime} - {user.endTime}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-sm">
                    <div className="font-semibold">{user.createdAt}</div>
                    <div className="text-xs text-slate-400">{user.updatedAt}</div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-indigo-600" onClick={() => handleSwapShift(user.id)}>
                      <RefreshCcw size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditUser(user.id)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <EmployeesSwitchModal
        open={modalOpen}
        currentUserId={currentUserId}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setCurrentUserId(null);
        }}
      />
    </div>
  );
}
