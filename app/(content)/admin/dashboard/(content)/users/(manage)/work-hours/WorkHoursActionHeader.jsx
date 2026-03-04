import { Input } from "@/_components/ui/Input";

export default function WorkHoursActionHeader({
  search, onSearchChange,
  searchInputRef,
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap pb-2">

      <div className="flex items-center gap-2">
        <Input ref={searchInputRef} value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search users..." className="w-full sm:w-64 py-2" typeSearch
        />
      </div>
    </div>
  );
}
