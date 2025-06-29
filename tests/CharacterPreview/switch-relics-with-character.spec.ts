import {
  expect,
  test,
} from '@playwright/test'

test('Switch relics between characters in Characters tab', async ({ page }) => {
  await page.goto('/#showcase')

  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await page.locator('#characterGrid').getByText('Jingliu').click()
  await expect(page.getByRole('img', { name: 'Band of Sizzling Thunder' })).toHaveCount(0)
  await expect(page.getByRole('img', { name: 'Space Sealing Station' })).toHaveCount(0)

  await page.getByRole('button', { name: 'user Character menu down' }).click()
  await page.getByRole('menuitem', { name: 'Switch relics with' }).click()
  await page.getByRole('dialog').locator('#selectedCharacter').click()
  await page.locator('.ant-select-dropdown').getByText('Kafka').click()
  await expect(page.getByRole('dialog')).toContainText('Kafka')
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('body')).toContainText('Successfully switched relics with ⚰️ Kafka')
  // Verify Jingliu now has Kafka's relics
  await expect(page.getByRole('img', { name: 'Band of Sizzling Thunder' }).first()).toBeVisible()
  await expect(page.getByRole('img', { name: 'Space Sealing Station' }).first()).toBeVisible()
  // Head
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15HP705ATK %10\.8%DEF %9\.7%SPD2Break Effect12\.3%Score17\.3 \(C\)$/ }).first()).toBeVisible()
  // Hands
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK352HP42ATK %15\.1%CRIT DMG11\.6%Break Effect5\.8%Score28\.7 \(A\+\)$/ }).first())
    .toBeVisible()
  // Body
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK %43\.2%HP71DEF %9\.1%SPD4Break Effect12\.3%Score15\.1 \(D\+\)$/ }).first()).toBeVisible()
  // Boots
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15SPD25DEF16ATK %4\.3%CRIT Rate2\.5%Effect RES19\.8%Score16\.3 \(C\)$/ }).first()).toBeVisible()
  // Orb
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15Lightning DMG38\.8%ATK59ATK %8\.2%DEF %5\.4%Effect HIT6\.9%Score14\.7 \(\?\)$/ }).first())
    .toBeVisible()
  // Rope
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK %43\.2%HP38ATK63SPD5Effect HIT8\.2%Score24\.9 \(B\+\)$/ }).first()).toBeVisible()

  // Verify Kafka now has Jingliu's relics
  await page.locator('#characterGrid').getByText('Kafka').click()
  await expect(page.getByRole('img', { name: 'Hunter of Glacial Forest' }).first()).toBeVisible()
  await expect(page.getByRole('img', { name: 'Rutilant Arena' }).first()).toBeVisible()
  // Head
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15HP705CRIT Rate11\.0%CRIT DMG10\.3%Effect RES3\.4%Break Effect5\.1%Score0\.0 \(F\)$/ }).first())
    .toBeVisible()
  // Hands
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK352HP %3\.4%SPD4CRIT DMG22\.6%Effect HIT3\.4%Score15\.0 \(D\+\)$/ }).first()).toBeVisible()
  // Body
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15CRIT DMG64\.8%HP114ATK %7\.3%DEF %4\.3%CRIT Rate8\.1%Score13\.9 \(\?\)$/ }).first())
    .toBeVisible()
  // Boots
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15SPD25ATK21ATK %11\.6%DEF %4\.8%CRIT DMG17\.4%Score31\.2 \(S\)$/ }).first()).toBeVisible()
  // Orb
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15Ice DMG38\.8%DEF74CRIT Rate5\.5%CRIT DMG12\.3%Effect HIT4\.3%Score3\.6 \(\?\)$/ }).first())
    .toBeVisible()
  // Rope
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK %43\.2%HP80CRIT Rate8\.4%CRIT DMG10\.3%Break Effect5\.8%Score5\.1 \(F\)$/ }).first())
    .toBeVisible()
})
