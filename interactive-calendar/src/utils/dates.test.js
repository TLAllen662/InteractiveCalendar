import test from 'node:test'
import assert from 'node:assert/strict'
import { formatDate, getMonthDays, parseDate, shiftMonth } from './dates.js'

test('validates calendar dates including leap days', () => {
  assert.equal(formatDate(parseDate('2024-02-29')), '2024-02-29')
  assert.equal(parseDate('2023-02-29'), null)
  assert.equal(parseDate('2024-13-01'), null)
  assert.equal(parseDate('0999-01-01'), null)
})

test('builds month days and navigates over year boundaries', () => {
  const days = getMonthDays(new Date(2024, 1, 1))
  assert.equal(days.slice(0, 4).every((day) => day === null), true)
  assert.equal(days[4], '2024-02-01')
  assert.equal(days.at(-1), '2024-02-29')
  assert.equal(formatDate(shiftMonth(new Date(2025, 0, 31), -1)), '2024-12-01')
})
