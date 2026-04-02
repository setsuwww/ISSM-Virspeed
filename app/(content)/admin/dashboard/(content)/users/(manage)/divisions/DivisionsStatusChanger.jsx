import { Check, X } from "lucide-react"

import { Switch } from "@/_components/ui/Switch"
import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"

export default function LocationStatusChanger({
  allActive, selectedCount,
  onToggleAll, onActivateSelected, onInactivateSelected,
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Switch checked={allActive} onCheckedChange={onToggleAll} />
        <div className="flex flex-col">
          <Label className="text-sm text-slate-600">Toggle Location</Label>
          <span className="text-xs text-slate-400">
            Set all Location status Active or Inactive
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <Button
          size="sm"
          variant="link"
          className="group text-sm rounded-full"
          disabled={selectedCount === 0}
          onClick={onActivateSelected}
        >
          <div className="p-0.5 rounded-full bg-teal-600/10 mr-0.5 border border-transparent group-hover:border group-hover:border-teal-400/20">
            <Check className="text-teal-600" />
          </div>
          <span className="group-hover:text-teal-600">Activate Selected</span>
        </Button>

        <Button
          size="sm"
          variant="link"
          className="group text-sm rounded-full"
          disabled={selectedCount === 0}
          onClick={onInactivateSelected}
        >
          <div className="p-0.5 rounded-full bg-rose-600/10 mr-0.5 border border-transparent group-hover:border group-hover:border-rose-400/20">
            <X className="text-rose-600" />
          </div>
          <span className="group-hover:text-rose-600">Inactivate Selected</span>
        </Button>
      </div>
    </div>
  )
}
