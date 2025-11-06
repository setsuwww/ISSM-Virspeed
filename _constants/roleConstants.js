export const roleOptions = [
  { label: "Admin", description: "Maintain and manage all contents", value: "ADMIN" },
  { label: "Employee", description: "Communicate with another person in division", value: "EMPLOYEE" },
  { label: "User", description: "Register, login and manage task", value: "USER" },
];

export const roleStyles = {
  Admin: "text-purple-600 bg-purple-100/50 border-purple-500/20",
  Coordinator: "text-sky-600 bg-sky-100/50 border-sky-500/20",
  Employee: "text-teal-600 bg-teal-100/50 border-teal-500/20",
  User: "text-slate-600 bg-slate-100/50 border-slate-500/20",
};