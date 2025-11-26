import { create } from "zustand"
import { apiFetchData } from "@/_function/helpers/fetch"

export const useDivisionStore = create((set, get) => ({
  allActive: false, pendingStatus: null, confirmOpen: false, loading: true,

  fetchConfig: async () => {
    try {
      const data = await apiFetchData({ url: "/system-config", method: "get",
        successMessage: null,
        useCache: true,
      })
      set({ allActive: data.allWfaActive, loading: false })
    } catch (err) { set({ loading: false })}
  },

  handleBulkToggle: () => { const newStatus = !get().allActive
    set({ pendingStatus: newStatus, confirmOpen: true })
  },

  confirmBulkToggle: async (onBulkUpdate, mutate) => {
    const { pendingStatus } = get()
    set({ allActive: pendingStatus, confirmOpen: false })

    try {
      await apiFetchData({ url: "/system-config", method: "patch", data: { allWfaActive: pendingStatus },
        successMessage: "Configuration updated successfully",
        errorMessage: "Failed to update configuration",
      })

      await onBulkUpdate?.({ activateType: "WFA", deactivateType: "WFO",
        isActive: pendingStatus,
      }); mutate?.()
    } catch (err) { console.error(err)}
  },

  closeDialog: () => set({ confirmOpen: false }),
}))
