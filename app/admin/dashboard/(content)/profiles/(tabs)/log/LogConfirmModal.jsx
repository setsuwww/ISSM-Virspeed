export function LogConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          Clear all activity logs?
        </h3>

        <p className="mt-2 text-sm text-gray-600">
          This action will permanently delete <b>all logs</b>.
          This cannot be undone.
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Cancel
          </button>

          <button onClick={() => { onConfirm()
              onClose()
            }} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Yes, clear logs
          </button>
        </div>
      </div>
    </div>
  )
}
