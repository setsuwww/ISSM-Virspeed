export function actionColor(action) {
  switch (action) {
    case "LOGIN_FAILED":
      return "text-red-600"
    case "ACCOUNT_LOCKED":
      return "text-red-700 font-bold"
    case "LOGIN_SUCCESS":
      return "text-emerald-600"
    case "LOGOUT":
      return "text-gray-600"
    default:
      return ""
  }
}
