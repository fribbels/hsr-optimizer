import {
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import type { ScreenshotSize } from 'lib/utils/screenshotUtils'

export const TEAM_SIZE = 4
// Captured at 10px and displayed at 6px.
export const GRID_GAP = 10
export const DISPLAY_SCALE = 0.6
export const GRID_ELEMENT_ID = 'teamShowcaseGrid'

export const GRID_SIZE: ScreenshotSize = {
  width: cardTotalW * 2 + GRID_GAP,
  height: parentH * 2 + GRID_GAP,
}
