/**
 * Date utility functions for the Church Member Management app
 */

/**
 * Generates an array of Sunday dates for the past year plus current week
 * @param weeksBack Number of weeks to go back (default: 52 for one year)
 * @returns Array of Sunday dates in YYYY-MM-DD format, sorted newest first
 */
export const getSundayDates = (weeksBack: number = 52): string[] => {
  const dates = [];
  const today = new Date();

  for (let i = -weeksBack; i < 1; i++) {
    // Calculate the target week's date
    const targetWeek = new Date(today);
    targetWeek.setDate(today.getDate() + i * 7);

    // Find Sunday of that week
    const sunday = new Date(targetWeek);
    sunday.setDate(targetWeek.getDate() - targetWeek.getDay());

    const dateString =
      sunday.getFullYear() +
      '-' +
      String(sunday.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(sunday.getDate()).padStart(2, '0');
    dates.push(dateString);
  }

  return dates.sort().reverse();
};

/**
 * Formats a date string to display date only (removes time component)
 * @param dateString Date string (can include time)
 * @returns Date string in YYYY-MM-DD format, or empty string if invalid
 */
export const formatDateOnly = (dateString?: string | null): string => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

/**
 * Gets the most recent Sunday date
 * @returns Sunday date in YYYY-MM-DD format
 */
export const getMostRecentSunday = (): string => {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return (
    sunday.getFullYear() +
    '-' +
    String(sunday.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(sunday.getDate()).padStart(2, '0')
  );
};

/**
 * Generates an array of future Sunday dates for events
 * @param weeksForward Number of weeks forward to generate (default: 26 for 6 months)
 * @returns Array of future Sunday dates in YYYY-MM-DD format, sorted newest first
 */
export const getFutureSundayDates = (weeksForward: number = 26): string[] => {
  const dates = [];
  const today = new Date();

  // Find next Sunday from today
  const nextSunday = new Date(today);
  const daysUntilNextSunday = 7 - today.getDay();
  nextSunday.setDate(
    today.getDate() + (daysUntilNextSunday === 7 ? 0 : daysUntilNextSunday)
  );

  for (let i = 0; i < weeksForward; i++) {
    const sunday = new Date(nextSunday);
    sunday.setDate(nextSunday.getDate() + i * 7);

    const dateString =
      sunday.getFullYear() +
      '-' +
      String(sunday.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(sunday.getDate()).padStart(2, '0');
    dates.push(dateString);
  }

  return dates;
};
