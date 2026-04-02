"use client";

import { useState, useEffect, useMemo } from "react";
import { CircleUserRound, RefreshCcw } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";
import { Checkbox } from "@/_components/ui/Checkbox";
import { Button } from "@/_components/ui/Button";
import EmptyStates from "@/_components/common/EmptyStates";

import { roleStyles } from "@/_constants/theme/userTheme";
import { capitalize } from "@/_functions/globalFunction";
import { EmployeesSwitchModal } from "../../../users/(manage)/employees/EmployeesSwitchModal";
import ListUsersActionHeader from "./ListUsersActionHeader";

import { useHandleUsers } from "@/_clients/handlers/admin/useHandleUsers";

export default function ListUsersTable({ data }) {
  const [users, setUsers] = useState(data);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => setUsers(data), [data]);

  const filteredData = useMemo(() => {
    let result = [...users];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    if (sortOrder === "A-Z") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "Z-A") result.sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [users, search, sortOrder]);

  const {
    toggleSelect, selectAll,
    deleteSelected, deleteAll,
    handleEditUser, handleDeleteUser
  } = useHandleUsers({ filteredData, selectedIds, setSelectedIds });

  const handleSwapShift = (userId) => {
    setCurrentUserId(userId);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <ListUsersActionHeader
        search={search} onSearchChange={setSearch}
        sortOrder={sortOrder} onSortOrderChange={setSortOrder}
        selectedCount={selectedIds.length}
        onDeleteSelected={deleteSelected} onDeleteAll={deleteAll}
        filteredData={filteredData}
      />

      {filteredData.length === 0 ? (
        <EmptyStates />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={selectedIds.length > 0 && selectedIds.length === filteredData.length}
                  onCheckedChange={() => selectAll(selectedIds.length !== filteredData.length)}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
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
                    <div className="icon-parent">
                      <CircleUserRound className="icon" strokeWidth={1} />
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
                    <div className="font-semibold">{user.locationName}</div>
                    <div className="text-xs text-slate-400">{user.startTime} - {user.endTime}</div>
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
                    <Button size="sm" variant="ghost" className="text-indigo-600 rounded-full" onClick={() => handleSwapShift(user.id)}>
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
