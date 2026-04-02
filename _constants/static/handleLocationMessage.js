export const confirmMessages = {
  deleteOne: (name) => ({
    message: `Are you sure you want to permanently delete the division "${name}"? This action cannot be undone and may affect users or records associated with this division.`,
    variant: "danger",
  }),

  deleteSelected: (count) => ({
    message: `You are about to permanently delete ${count} selected divisions. This action cannot be undone. Do you want to continue?`,
    variant: "danger",
  }),

  deleteAll: {
    message: `This will permanently delete ALL divisions in the system. This is an irreversible action and may impact any users, schedules, or records associated with these divisions. Are you absolutely sure you want to proceed?`,
    variant: "danger",
  },

  bulkUpdate: (count, mode) => ({
    message: `You are about to update the status of ${count} selected divisions to "${mode}". This may affect visibility and accessibility for users associated with these divisions. Proceed with the bulk update?`,
    variant: "warning",
  }),
};
