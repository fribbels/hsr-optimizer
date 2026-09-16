import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { cardTotalW } from 'lib/constants/constantsUi'
import styles from 'lib/tabs/tabTeamShowcase/TeamCardGrid.module.css'
import {
  DISPLAY_SCALE,
  GRID_ELEMENT_ID,
  GRID_GAP,
  GRID_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import { SCREENSHOT_SCALE_WRAPPER_ATTR } from 'lib/utils/screenshotUtils'
import type { ReactNode } from 'react'
import type { Character } from 'types/character'

/**
 * The 2x2 card grid that the screenshot captures, rendered at full card resolution and
 * shrunk for display. The cards are inert: they take no clicks, hovers, or focus. All
 * interaction comes from `renderSlotOverlay`, which sits in a layer above the grid, outside
 * the captured element, so it never appears in the screenshot.
 */
export function TeamCardGrid({
  characters,
  scale = DISPLAY_SCALE,
  renderSlotOverlay,
  className,
}: {
  characters: (Character | null)[],
  /** Display scale of the full-resolution grid */
  scale?: number,
  /** Per-slot controls layered over each card, kept out of the capture */
  renderSlotOverlay?: (index: number, character: Character | null) => ReactNode,
  className?: string,
}) {
  const overlayGap = GRID_GAP * scale

  return (
    <div
      className={[styles.viewport, className].filter(Boolean).join(' ')}
      style={{
        width: GRID_SIZE.width * scale,
        height: GRID_SIZE.height * scale,
      }}
    >
      <div
        className={styles.scaleWrapper}
        style={{ transform: `scale(${scale})` }}
        inert
        {...{ [SCREENSHOT_SCALE_WRAPPER_ATTR]: '' }}
      >
        <div
          id={GRID_ELEMENT_ID}
          className={styles.grid}
          style={{
            gridTemplateColumns: `${cardTotalW}px ${cardTotalW}px`,
            gap: GRID_GAP,
            width: GRID_SIZE.width,
          }}
        >
          {characters.map((character, index) => (
            <CharacterPreview
              key={index}
              id={`teamShowcaseCard${index}`}
              source={ShowcaseSource.TEAM}
              character={character}
            />
          ))}
        </div>
      </div>

      {renderSlotOverlay && (
        <div
          className={styles.overlayLayer}
          style={{
            gridTemplateColumns: '1fr 1fr',
            gap: overlayGap,
          }}
        >
          {characters.map((character, index) => (
            <div key={index} className={styles.overlayCell}>
              {renderSlotOverlay(index, character)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
