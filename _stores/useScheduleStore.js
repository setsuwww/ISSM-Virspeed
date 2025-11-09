import { create } from "zustand"

export const useScheduleStore = create((set, get) => ({
  form: {
    title: "",
    description: "",
    frequency: "ONCE",
  },
  events: [],
  loading: false,
  mode: "create", // "create" | "edit"
  scheduleId: null,

  setFormField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
    })),

  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  removeEvent: (index) =>
    set((state) => ({ events: state.events.filter((_, i) => i !== index) })),

  setLoading: (value) => set({ loading: value }),
  setMode: (mode) => set({ mode }),
  setScheduleId: (id) => set({ scheduleId: id }),

  resetForm: () =>
    set({
      form: { title: "", description: "", frequency: "ONCE" },
      events: [],
      loading: false,
      mode: "create",
      scheduleId: null,
    }),

  loadFromSchedule: (schedule) =>
    set({
      form: {
        title: schedule?.title ?? "",
        description: schedule?.description ?? "",
        frequency: schedule?.frequency ?? "ONCE",
      },
      events: [
        {
          startDate: schedule?.startDate || "",
          endDate: schedule?.endDate || "",
          startTime: schedule?.startTime || "",
          endTime: schedule?.endTime || "",
          users: schedule?.users || [],
        },
      ],
      scheduleId: schedule?.id ?? null,
      mode: "edit",
    }),

  totalAssignedUsers: () =>
    get().events.reduce((acc, e) => acc + e.users.length, 0),
}))
