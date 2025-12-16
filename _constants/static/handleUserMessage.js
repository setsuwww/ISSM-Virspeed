export const confirmMessages = {
  deleteOne: {
    message: `Are you sure you want to delete this user? This action is irreversible and may affect linked records.`,
    variant: "danger",
  },

  deleteSelected: (count) => ({
    message: `You are about to delete ${count} selected users. This action cannot be undone and will permanently remove their data. Proceed with deletion?`,
    variant: "danger",
  }),

  deleteAll: (count) => ({
    message: `You are about to delete ALL ${count} users currently displayed. This cannot be undone. Are you absolutely sure you want to continue?`,
    variant: "danger",
  }),
};
