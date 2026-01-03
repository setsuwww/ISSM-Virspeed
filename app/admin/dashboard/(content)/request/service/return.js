import { handleRequests } from "./request.service";

export async function getRequests(mode) {
  return handleRequests(mode)
}