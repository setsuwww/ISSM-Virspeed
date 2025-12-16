import { Check, X } from "lucide-react"

import { Switch } from "@/_components/ui/Switch"
import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"

export default function DivisionStatusChanger({
  allActive, selectedCount,
  onToggleAll, onActivateSelected, onInactivateSelected,
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Switch checked={allActive} onCheckedChange={onToggleAll} />
        <div className="flex flex-col">
          <Label className="text-sm text-slate-600">Toggle Division</Label>
          <span className="text-xs text-slate-400">
            Set all Division status Active or Inactive
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs rounded-full"
          disabled={selectedCount === 0}
          onClick={onActivateSelected}
        >
          <Check className="text-teal-600" />
          Activate Selected
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-xs rounded-full"
          disabled={selectedCount === 0}
          onClick={onInactivateSelected}
        >
          <X className="text-rose-600" />
          Inactivate Selected
        </Button>
      </div>
    </div>
  )
}