import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import duration from "dayjs/plugin/duration"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"

if (!dayjs.__extended) {
  dayjs.extend(isSameOrBefore)
  dayjs.extend(isSameOrAfter)
  dayjs.extend(duration)
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.__extended = true
}

export default dayjs
