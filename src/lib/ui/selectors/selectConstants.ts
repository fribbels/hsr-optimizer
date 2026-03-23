import type { ElementName, PathName } from 'lib/constants/constants'
import type { CharacterOptions } from 'lib/ui/selectors/optionGenerator'
import type { CharacterId } from 'types/character'

/**
 * Character card: image rendered at 150px wide in a ~100px card.
 * translateX centers the oversized image, translateY shifts up to show face.
 * overflow: hidden on the card clips the excess.
 */
export const CHARACTER_CARD_IMAGE_WIDTH = '150px'
export const CHARACTER_CARD_IMAGE_X_OFFSET = '-13%'
export const CHARACTER_CARD_IMAGE_Y_OFFSET = '-5%'

/**
 * Light cone card: image rendered at 115px wide in a ~100px card.
 * Less zoom than characters since LC icons are smaller/squarer.
 */
export const LC_CARD_IMAGE_WIDTH = '115px'
export const LC_CARD_IMAGE_X_OFFSET = '-7%'
export const LC_CARD_IMAGE_Y_OFFSET = '0%'

/** Card heights for gradient stop points */
export const CHARACTER_CARD_IMAGE_HEIGHT = '130px'
export const LC_CARD_IMAGE_HEIGHT = '112px'

/** Shared OverlayScrollbars config */
export const OVERLAY_SCROLLBAR_OPTIONS = { scrollbars: { autoHide: 'move' as const, autoHideDelay: 500 } }

/** Shared modal styles for character selectors (both single and multi) */
export const CHARACTER_MODAL_STYLES = {
  content: { height: '80%', maxWidth: 1450 },
  body: { height: 'calc(100% - 60px)', overflow: 'hidden' as const },
}

/** Shared modal styles for light cone selector */
export const LC_MODAL_STYLES = {
  content: { height: '70%', maxWidth: 1200 },
  body: { height: 'calc(100% - 60px)', overflow: 'hidden' as const },
}

/** Shared search input styles — 40px to match SegmentedFilterRow height */
export const SEARCH_INPUT_STYLES = {
  wrapper: { height: 40 },
  input: { height: 40, minHeight: 40, fontSize: 14 },
}

/** Character filter types shared between CharacterSelect and CharacterMultiSelect */
export type CharacterFilters = {
  element: ElementName[]
  path: PathName[]
  name: string
}

export const defaultCharacterFilters: CharacterFilters = {
  element: [],
  path: [],
  name: '',
}

export function applyCharacterFilters(filters: CharacterFilters, x: CharacterOptions[CharacterId]): boolean {
  if (filters.element.length && !filters.element.includes(x.element)) return false
  if (filters.path.length && !filters.path.includes(x.path)) return false
  return x.label.toLowerCase().includes(filters.name)
}
