import { create } from "zustand";
import { DATE_RANGES } from "@/_components/_constants/static/filterAttendanceGraphic";

export const useChartStore = create((set) => ({
  selectedRange: "thisWeek",

  setRange: (rangeKey) => set({ selectedRange: rangeKey }),

  getSelectedDateRange: () => {
    const rangeKey = useChartStore.getState().selectedRange;
    return DATE_RANGES[rangeKey].getRange();
  },
}));
