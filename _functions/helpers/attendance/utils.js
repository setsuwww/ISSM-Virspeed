/**
 * Adds a number of work days to a date, skipping weekends (Saturday and Sunday).
 * @param {Date} date - The starting date.
 * @param {number} days - The number of work days to add.
 * @returns {Date} - The resulting date.
 */
export function addWorkDays(date, days) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added++;
    }
  }
  return result;
}
