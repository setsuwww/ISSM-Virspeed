// Server-side attendance helpers (Prisma/Auth dependent)

export * from "./attendanceHelpers";

export {
  evaluateAttendancePolicy,
  isUserWithinLocation,
  determineAttendanceStatus,
} from "./attendance/checkin_helper";

export {
  isEarlyCheckout,
  canUserCheckout,
  getCheckoutWarning,
} from "./attendance/checkout_helper";

export {
  shouldRemindForgotCheckout,
  checkForgotCheckoutStatus,
  autoCheckoutUser,
  batchAutoCheckout,
  isForgotCheckoutEligible,
  getForgotCheckoutWarning,
  getForgotCheckoutDeadline,
} from "./attendance/forgotCheckout_helper";

export {
  getActiveAssignment,
} from "./attendance/assignment_helper";

export {
  processPermissionRequest,
  processLeaveRequest,
} from "./attendance/request_helper";
