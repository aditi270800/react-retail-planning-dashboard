import type { WeekDefinition } from '../types'

/**
 * Generates week definitions for a given year.
 * Produces ~52 weeks grouped by month label.
 */
export function generateWeeks(year: number): WeekDefinition[] {
  const weeks: WeekDefinition[] = []
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
  ]

  let weekNum = 1
  for (let month = 0; month < 12; month++) {
    const weeksInMonth = month === 1 ? 4 : 4 // 4 weeks per month for simplicity
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

    for (let w = 1; w <= weeksInMonth; w++) {
      const weekStr = String(weekNum).padStart(2, '0')
      weeks.push({
        week: `${year}-W${weekStr}`,
        label: `W${w}`,
        month: months[month],
        monthKey,
      })
      weekNum++
    }
  }

  return weeks
}

/**
 * Get only the first N months of weeks (for performance in demo).
 */
export function getWeeksForMonths(year: number, monthCount: number): WeekDefinition[] {
  return generateWeeks(year).slice(0, monthCount * 4)
}

export const PLANNING_WEEKS = getWeeksForMonths(2024, 6) // Jan–Jun 2024
