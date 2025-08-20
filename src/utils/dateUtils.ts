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
    const date = new Date(today);
    date.setDate(today.getDate() + (i * 7));
    const sunday = new Date(date.setDate(date.getDate() - date.getDay()));
    dates.push(sunday.toISOString().split('T')[0]);
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
  const sunday = new Date(today.setDate(today.getDate() - today.getDay()));
  return sunday.toISOString().split('T')[0];
};