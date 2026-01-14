import { Input } from "@/_components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";

export default function WorkHoursActionHeader({
  search, onSearchChange,
  roleFilter, onRoleFilterChange,
  searchInputRef,
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap pb-2">

      <div className="flex items-center gap-2">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-auto px-3 whitespace-nowrap">
            <span className="font-semibold text-slate-600 mr-1">Role:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
            <SelectItem value="USER">User</SelectItem>
          </SelectContent>
        </Select>

        <Input ref={searchInputRef} value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search users..." className="w-full sm:w-64 py-2" typeSearch
        />
      </div>
    </div>
  );
}
