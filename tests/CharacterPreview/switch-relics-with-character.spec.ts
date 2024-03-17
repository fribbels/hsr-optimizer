import { expect, test } from '@playwright/test'

test('Switch relics between characters in Characters tab', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await page.locator('#characterGrid').getByText('Jingliu').click()
  await expect(page.getByRole('img', { name: 'Band of Sizzling Thunder' })).toHaveCount(0)
  await expect(page.getByRole('img', { name: 'Space Sealing Station' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Actions down' }).click()
  await page.getByText('Switch relics with').click()
  await page.getByRole('dialog').locator('#selectedCharacter').click()
  await page.locator('.ant-select-dropdown').getByTitle('Kafka').click()
  await expect(page.getByRole('dialog')).toContainText('Kafka')
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('body')).toContainText('Successfully switched relics to Kafka')

  // Verify Jingliu now has Kafka's relics
  await expect(page.getByRole('img', { name: 'Band of Sizzling Thunder' })).toHaveCount(4)
  await expect(page.getByRole('img', { name: 'Space Sealing Station' })).toHaveCount(2)
  // Head
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15HP705ATK %10\.8%DEF %9\.7%SPD2Break Effect12\.3%Score17\.3 \(C\)$/ })).toHaveCount(1)
  // Hands
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK352HP42ATK %15\.1%CRIT DMG11\.6%Break Effect5\.8%Score28\.7 \(A\+\)$/ })).toHaveCount(1)
  // Body
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK %43\.2%HP71DEF %9\.1%SPD4Break Effect12\.3%Score15\.3 \(D\+\)$/ })).toHaveCount(1)
  // Boots
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15SPD25DEF16ATK %4\.3%CRIT Rate2\.5%Effect RES19\.8%Score18\.0 \(C\+\)$/ })).toHaveCount(1)
  // Orb
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15Lightning DMG38\.8%ATK59ATK %8\.2%DEF %5\.4%Effect Hit Rate6\.9%Score14\.1 \(D\+\)$/ })).toHaveCount(1)
  // Rope
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK %43\.2%HP38ATK63SPD5Effect Hit Rate8\.2%Score22\.3 \(B\)$/ })).toHaveCount(1)

  // Verify Kafka now has Jingliu's relics
  await page.locator('#characterGrid').getByText('Kafka').click()
  await expect(page.getByRole('img', { name: 'Hunter of Glacial Forest' })).toHaveCount(4)
  await expect(page.getByRole('img', { name: 'Rutilant Arena' })).toHaveCount(2)
  // Head
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15HP705CRIT Rate11\.0%CRIT DMG10\.3%Effect RES3\.4%Break Effect5\.1%Score20\.1 \(C\+\)$/ })).toHaveCount(1)
  // Hands
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK352HP %3\.4%SPD4CRIT DMG22\.6%Effect Hit Rate3\.4%Score24\.3 \(B\+\)$/ })).toHaveCount(1)
  // Body
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15CRIT DMG64\.8%HP114ATK %7\.3%DEF %4\.3%CRIT Rate8\.1%Score23\.3 \(B\+\)$/ })).toHaveCount(1)
  // Boots
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15SPD25ATK21ATK %11\.6%DEF %4\.8%CRIT DMG17\.4%Score36\.6 \(SS\)$/ })).toHaveCount(1)
  // Orb
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15Ice DMG38\.8%DEF74CRIT Rate5\.5%CRIT DMG12\.3%Effect Hit Rate4\.3%Score14\.9 \(D\+\)$/ })).toHaveCount(1)
  // Rope
  await expect(page.locator('.ant-card').filter({ hasText: /^\+15ATK %43\.2%HP80CRIT Rate8\.4%CRIT DMG10\.3%Break Effect5\.8%Score23\.5 \(B\+\)$/ })).toHaveCount(1)
})
