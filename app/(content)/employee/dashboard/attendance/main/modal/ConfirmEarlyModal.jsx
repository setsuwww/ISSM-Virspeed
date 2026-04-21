import { AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
} from "@/_components/ui/Alert-dialog"

export function ConfirmEarlyModal({ open, loading, onClose, onSubmit }) {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onClose()}>
      <AlertDialogContent variant="warning" className="sm:max-w-[420px]">
        <AlertDialogHeader>
          <AlertDialogTitle variant="warning">
            Shift Anda Belum Berakhir
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ingin pulang awal dan urgent? ajukan Pulang awal agar tetap tercatat dengan baik oleh sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" strokeWidth={2.5} />
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 rounded-xl"
          >
            {loading ? "Memproses..." : "Ya, Ajukan Pulang Awal"}
          </AlertDialogAction>
          
          <AlertDialogCancel
            disabled={loading}
            className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-semibold"
          >
            Batalkan
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
