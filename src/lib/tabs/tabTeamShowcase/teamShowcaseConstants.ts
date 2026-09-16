import {
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import type { ScreenshotSize } from 'lib/utils/screenshotUtils'

export const TEAM_SIZE = 4
export const GRID_GAP = 16
export const DISPLAY_SCALE = 0.5
export const GRID_ELEMENT_ID = 'teamShowcaseGrid'

/** Full-resolution size of the captured 2x2 grid, in CSS pixels */
export const GRID_SIZE: ScreenshotSize = {
  width: cardTotalW * 2 + GRID_GAP,
  height: parentH * 2 + GRID_GAP,
}
