import {
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import type { ScreenshotSize } from 'lib/utils/screenshotUtils'

export const TEAM_SIZE = 4
/**
 * Full-resolution gap between cards. It is inside the captured element, so it is also the gap in the
 * screenshot. A multiple of 5 so that it displays at a whole pixel (6px) at the display scale.
 */
export const GRID_GAP = 10
/**
 * The 1100x880 cards display at 660x528. Every dimension stays a whole pixel at this scale, which keeps
 * the art from softening; 0.625 and above would put the cards on half pixels.
 */
export const DISPLAY_SCALE = 0.6
export const GRID_ELEMENT_ID = 'teamShowcaseGrid'

/** Full-resolution size of the captured 2x2 grid, in CSS pixels */
export const GRID_SIZE: ScreenshotSize = {
  width: cardTotalW * 2 + GRID_GAP,
  height: parentH * 2 + GRID_GAP,
}
