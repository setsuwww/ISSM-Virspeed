export const confirmMessages = {
  deleteOne: {
    message: `Are you sure you want to permanently delete this schedule? This action cannot be undone. Are you sure?`,
    variant: "danger",
  },

  deleteSelected: (count) => ({
    message: `You are about to delete ${count} selected schedules. This action is irreversible. Proceed with deletion?`,
    variant: "danger",
  }),

  deleteAll: (count) => ({
    message: `You are about to delete ALL ${count} schedules currently displayed. This cannot be undone. Are you absolutely sure?`,
    variant: "danger",
  }),
};
