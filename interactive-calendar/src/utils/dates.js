export function formatDate(date) {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split('-').map(Number)
  if (year < 1000 || year > 9999) return null
  const date = new Date(year, month - 1, day)
  return formatDate(date) === value ? date : null
}

export function getMonthDays(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const days = Array(firstDay.getDay()).fill(null)

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(formatDate(new Date(date.getFullYear(), date.getMonth(), day)))
  }
  return days
}

export function shiftMonth(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

export function formatLongDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(parseDate(value))
}
