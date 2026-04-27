import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export const DATE_RANGES = {
  today: {
    label: "Now",
    getRange: () => ({
      start: new Date(),
      end: new Date(),
    }),
  },
  yesterday: {
    label: "Yesterday",
    getRange: () => ({
      start: subDays(new Date(), 1),
      end: subDays(new Date(), 1),
    }),
  },
  thisWeek: {
    label: "This week",
    getRange: () => ({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  lastWeek: {
    label: "Past week",
    getRange: () => {
      const today = new Date();
      const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
      return { start: lastWeekStart, end: lastWeekEnd };
    },
  },
  thisMonth: {
    label: "This month",
    getRange: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
  lastMonth: {
    label: "Past month",
    getRange: () => {
      const today = new Date();
      const lastMonthStart = startOfMonth(subDays(today, 30));
      const lastMonthEnd = endOfMonth(subDays(today, 30));
      return { start: lastMonthStart, end: lastMonthEnd };
    },
  },
};
