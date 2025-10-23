import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

/**
 * Formats a date into 'Tue 19th 2023' style.
 * @param date - A Date object, timestamp, or ISO string.
 * @returns Formatted date string.
 */
export function formatDate(date: string | number | Date): string {
  return dayjs(date).format("ddd Do YYYY");
}

export default dayjs;
