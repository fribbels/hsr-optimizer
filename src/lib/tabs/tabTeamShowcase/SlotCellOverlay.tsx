import {
  IconArrowsExchange,
  IconPlus,
} from '@tabler/icons-react'
import styles from 'lib/tabs/tabTeamShowcase/SlotCellOverlay.module.css'
import type { SlotInteractions } from 'lib/tabs/tabTeamShowcase/useSlotInteractions'
import { useTranslation } from 'react-i18next'

const HINT_ICON_SIZE = 14
const ADD_ICON_SIZE = 28

/**
 * Click target covering one card cell of the TeamCardGrid. The cards themselves are inert, so this
 * is the only way to interact with a cell: clicking opens the character picker for the slot.
 * Filled cells show a "Swap" hint on hover; empty cells are a dashed add target.
 * The tile in the rail carries the paired-hover highlight, so the cell only reacts to keyboard focus.
 */
export function SlotCellOverlay({
  index,
  filled,
  interactions,
}: {
  index: number,
  filled: boolean,
  interactions: SlotInteractions,
}) {
  const { t } = useTranslation('teamShowcaseTab')
  const { setPickerSlot, hoverStart, hoverEnd } = interactions

  return (
    <button
      type='button'
      className={filled ? styles.cellTarget : styles.emptyCellTarget}
      aria-label={filled ? t('Buttons.Swap') : t('Buttons.AddCharacter')}
      onClick={() => setPickerSlot(index)}
      onMouseEnter={() => hoverStart(index)}
      onMouseLeave={() => hoverEnd(index)}
    >
      {filled
        ? (
          <span className={styles.cellHint}>
            <IconArrowsExchange size={HINT_ICON_SIZE} />
            {t('Buttons.Swap')}
          </span>
        )
        : (
          <>
            <span className={styles.emptyCellIcon}>
              <IconPlus size={ADD_ICON_SIZE} />
            </span>
            <span className={styles.emptyCellLabel}>{t('Buttons.AddCharacter')}</span>
          </>
        )}
    </button>
  )
}
