import { formatDate, formatLongDate, getMonthDays, parseDate, shiftMonth } from '../utils/dates.js'
import Card from './Card.jsx'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function CalendarGrid({ selectedDate, today, tasks, onSelectDate }) {
  const selected = parseDate(selectedDate)
  const monthTitle = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(selected)
  const counts = tasks.reduce((result, task) => {
    result[task.date] = (result[task.date] || 0) + 1
    return result
  }, {})

  function goToMonth(offset) {
    onSelectDate(formatDate(shiftMonth(selected, offset)))
  }

  return (
    <Card className="calendar-card">
      <div className="calendar-heading">
        <div>
          <p className="eyebrow">Your schedule</p>
          <h2>{monthTitle}</h2>
        </div>
        <div className="calendar-controls">
          <button type="button" className="button button-secondary" onClick={() => goToMonth(-1)} disabled={selectedDate.startsWith('1000-01')} aria-label="Previous month">‹</button>
          <button type="button" className="button button-secondary" onClick={() => onSelectDate(formatDate(new Date()))}>Today</button>
          <button type="button" className="button button-secondary" onClick={() => goToMonth(1)} disabled={selectedDate.startsWith('9999-12')} aria-label="Next month">›</button>
        </div>
      </div>
      <div className="calendar-grid" aria-label={`${monthTitle} calendar`}>
        {weekdays.map((day) => <div className="weekday" key={day}>{day}</div>)}
        {getMonthDays(selected).map((date, index) => date ? (
          <button
            type="button"
            className={`calendar-day${date === selectedDate ? ' selected' : ''}${date === today ? ' today' : ''}`}
            key={date}
            aria-label={`${formatLongDate(date)}${counts[date] ? `, ${counts[date]} ${counts[date] === 1 ? 'task' : 'tasks'}` : ''}`}
            aria-pressed={date === selectedDate}
            onClick={() => onSelectDate(date)}
          >
            <span>{Number(date.slice(-2))}</span>
            {counts[date] > 0 && <span className="task-count" aria-hidden="true">{counts[date]}</span>}
          </button>
        ) : <div key={`empty-${index}`} aria-hidden="true" />)}
      </div>
    </Card>
  )
}

export default CalendarGrid
