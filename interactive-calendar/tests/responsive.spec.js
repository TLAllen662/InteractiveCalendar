import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'small mobile', width: 320, height: 640, columns: 1 },
  { name: 'mobile', width: 390, height: 844, columns: 1 },
  { name: 'tablet', width: 768, height: 1024, columns: 1 },
  { name: 'wide tablet', width: 1024, height: 768, columns: 2 },
  { name: 'desktop', width: 1440, height: 900, columns: 2 },
]

for (const viewport of viewports) {
  test(`${viewport.name} layout and controls`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Your calendar' })).toBeVisible()

    const columns = await page.locator('.calendar-layout').evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(' ').length,
    )
    expect(columns).toBe(viewport.columns)

    const title = 'LongStudyTask'.repeat(12)
    await page.getByLabel('Task', { exact: true }).fill(title)
    await page.getByRole('button', { name: 'Add task' }).click()
    await expect(page.getByRole('checkbox', { name: title })).toBeVisible()

    const measurements = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      inputFontSize: parseFloat(getComputedStyle(document.querySelector('#task-title')).fontSize),
      navigation: Array.from(document.querySelectorAll('.nav-link'), (element) => element.getBoundingClientRect().height),
      buttons: Array.from(document.querySelectorAll('.button, .text-button'), (element) => ({
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
      })),
      days: Array.from(document.querySelectorAll('.calendar-day'), (element) => ({
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
      })),
      taskLabelHeight: document.querySelector('.task-label').getBoundingClientRect().height,
    }))
    expect(measurements.pageWidth).toBeLessThanOrEqual(measurements.viewportWidth)
    expect(measurements.inputFontSize).toBeGreaterThanOrEqual(16)
    expect(measurements.navigation.every((height) => height >= 44)).toBe(true)
    expect(measurements.buttons.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true)
    expect(measurements.days.every(({ width, height }) => width >= 24 && height >= 44)).toBe(true)
    expect(measurements.taskLabelHeight).toBeGreaterThanOrEqual(44)

    await page.getByRole('link', { name: 'Courses' }).click()
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
    await page.getByRole('link', { name: 'Calendar', exact: true }).click()
    await expect(page.getByRole('checkbox', { name: title })).toBeVisible()
  })
}
