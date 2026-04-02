export const confirmMessages = {
  deleteOne: (name) => ({
    message: `Are you sure you want to permanently delete the location "${name}"? This action cannot be undone and may affect users or records associated with this location.`,
    variant: "danger",
  }),

  deleteSelected: (count) => ({
    message: `You are about to permanently delete ${count} selected locations. This action cannot be undone. Do you want to continue?`,
    variant: "danger",
  }),

  deleteAll: {
    message: `This will permanently delete ALL locations in the system. This is an irreversible action and may impact any users, schedules, or records associated with these locations. Are you absolutely sure you want to proceed?`,
    variant: "danger",
  },

  bulkUpdate: (count, mode) => ({
    message: `You are about to update the status of ${count} selected locations to "${mode}". This may affect visibility and accessibility for users associated with these locations. Proceed with the bulk update?`,
    variant: "warning",
  }),
};
