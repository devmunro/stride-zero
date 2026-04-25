/**
 * Formats a date-like value into a stable YYYY-MM-DD key.
 *
 * @param {Date|string|number} value Source date
 * @returns {string} Date key
 */
export function getDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns a human-readable label for a date key.
 *
 * @param {string} dateKey YYYY-MM-DD key
 * @returns {string} Friendly date
 */
export function formatDateLabel(dateKey) {
  const value = new Date(`${dateKey}T12:00:00`);
  return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Builds a coarse week bucket key for progress summaries.
 *
 * @param {string} dateKey YYYY-MM-DD key
 * @returns {string} Week bucket key
 */
export function getWeekBucket(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + delta);
  return getDateKey(date);
}

/**
 * Returns the last N calendar days including today.
 *
 * @param {number} count Number of days
 * @returns {string[]} Ordered date keys
 */
export function getRecentDateKeys(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return getDateKey(date);
  });
}
