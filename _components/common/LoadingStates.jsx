import { Loader } from "lucide-react";

export default function LoadingStates() {
  return (
    <div className="relative flex items-center justify-center py-20 px-6 rounded-2xl border border-slate-200 bg-slate-50">
      {/* subtle backdrop */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/60 to-transparent" />

      <div className="relative flex flex-col items-center gap-4 text-slate-600">
        <Loader className="h-12 w-12 animate-spin text-slate-700" strokeWidth={1.5} />
        <div className="text-center">
          <p className="text-base font-medium">Loading data</p>
          <p className="text-sm text-slate-500">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
}
