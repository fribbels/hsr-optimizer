import {
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import type { ScreenshotSize } from 'lib/utils/screenshotUtils'

export const TEAM_SIZE = 4
// Space between cards in CSS px. Screenshots export at 2x density, so 6 becomes 12 image pixels.
// The display scales it down with the cards.
export const GRID_GAP = 6
export const DISPLAY_SCALE = 0.6
export const GRID_ELEMENT_ID = 'teamShowcaseGrid'

export const GRID_SIZE: ScreenshotSize = {
  width: cardTotalW * 2 + GRID_GAP,
  height: parentH * 2 + GRID_GAP,
}
