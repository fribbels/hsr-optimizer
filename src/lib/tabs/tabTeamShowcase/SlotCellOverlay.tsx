import { Button } from '@mantine/core'
import {
  IconArrowsMove,
  IconChartBar,
  IconCrown,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import styles from 'lib/tabs/tabTeamShowcase/SlotCellOverlay.module.css'
import { SlotDragContext } from 'lib/tabs/tabTeamShowcase/slotDrag'
import { SlotScoringSelect } from 'lib/tabs/tabTeamShowcase/SlotScoringSelect'
import type { SlotScoring } from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import type { SlotInteractions } from 'lib/tabs/tabTeamShowcase/useSlotInteractions'
import {
  type FocusEvent,
  type MouseEvent,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'

const ADD_ICON_SIZE = 28
const CONTROL_ICON_SIZE = 16
const HANDLE_ICON_SIZE = 44
const CHANGE_CHARACTER_BUTTON_HEIGHT = 54
const CONTROL_SIZE = 'md'
const SCORING_DROPDOWN_CLASS_NAME = 'team-showcase-scoring-dropdown'
const SCORING_DROPDOWN_SELECTOR = `.${SCORING_DROPDOWN_CLASS_NAME}`

const ART_BUTTON_CLASS_NAMES = { root: styles.artButton }
const ART_SELECT_CLASS_NAMES = {
  input: `${styles.artInput} ${styles.scoringInput}`,
  section: styles.artSection,
  dropdown: SCORING_DROPDOWN_CLASS_NAME,
}

/** A click with no pointer behind it, i.e. keyboard activation, reports zero clicks */
const KEYBOARD_CLICK_DETAIL = 0
const POINTER_DOWN_EVENT = 'pointerdown'

/**
 * Interaction layer above an inert card. The card-wide target owns reveal and pointer drag; controls sit
 * above it so they never begin a drag. Shared reveal state keeps one card open, and all controls step
 * aside while any card moves. This layer is outside the captured grid.
 */
export function SlotCellOverlay({
  index,
  filled,
  interactions,
  scoring,
  onScoringChange,
  onRemove,
}: {
  index: number,
  filled: boolean,
  interactions: SlotInteractions,
  scoring: SlotScoring | null,
  onScoringChange: (scoringType: ScoringType) => void,
  onRemove: () => void,
}) {
  const { t } = useTranslation('teamShowcaseTab')
  const {
    setPickerSlot,
    revealedSlot,
    revealSlot,
    toggleRevealedSlot,
    concealSlot,
  } = interactions
  const drag = useContext(SlotDragContext)
  const dragActive = drag?.dragActive ?? false
  const revealed = revealedSlot === index
  const selectedScoringLabel = scoring?.options.find((option) => option.value === String(scoring.value))?.label
  const cellRef = useRef<HTMLDivElement>(null)

  // A pointer-down anywhere outside this card releases it, which is the only way to dismiss on touch
  useEffect(() => {
    if (!revealed) return
    const handlePointerDown = (event: Event) => {
      const cell = cellRef.current
      const target = event.target
      if (!(target instanceof Node)) return
      if (target instanceof Element && target.closest(SCORING_DROPDOWN_SELECTOR)) return
      if (cell && !cell.contains(target)) concealSlot(index)
    }
    document.addEventListener(POINTER_DOWN_EVENT, handlePointerDown)
    return () => document.removeEventListener(POINTER_DOWN_EVENT, handlePointerDown)
  }, [revealed, index, concealSlot])

  const openPicker = () => setPickerSlot(index)

  if (!filled) {
    const isMainDpsSlot = index === 0
    const addCharacterLabel = t(isMainDpsSlot ? 'Buttons.AddMainDps' : 'Buttons.AddCharacter')

    return (
      <button
        type='button'
        className={styles.emptyCellTarget}
        aria-label={addCharacterLabel}
        onClick={openPicker}
      >
        <span className={`${styles.emptyCellIcon} ${isMainDpsSlot ? styles.mainDpsEmptyCellIcon : ''}`}>
          <svg
            className={styles.emptyCellIconRing}
            viewBox='0 0 60 60'
            aria-hidden='true'
          >
            <circle cx='30' cy='30' r='28.5' />
          </svg>
          {isMainDpsSlot
            ? <IconCrown size={ADD_ICON_SIZE} />
            : <IconPlus size={ADD_ICON_SIZE} />}
        </span>
        <span className={styles.emptyCellLabel}>{addCharacterLabel}</span>
      </button>
    )
  }

  // Focus moving between elements inside the card is not a release
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return
    concealSlot(index)
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === KEYBOARD_CLICK_DETAIL) toggleRevealedSlot(index)
  }

  return (
    <div
      ref={cellRef}
      className={styles.cell}
      data-revealed={revealed}
      data-drag-active={dragActive}
      data-dragging={drag?.isDragging ?? false}
      onMouseEnter={() => !dragActive && revealSlot(index)}
      onMouseLeave={() => !dragActive && concealSlot(index)}
      onFocus={() => !dragActive && revealSlot(index)}
      onBlur={handleBlur}
    >
      <button
        type='button'
        ref={drag?.setActivatorNodeRef}
        className={styles.cellTarget}
        aria-label={t('CardOptions')}
        aria-expanded={revealed}
        onPointerUp={() => revealSlot(index)}
        onClick={handleClick}
        {...drag?.listeners}
      />

      <div className={styles.cellScrim} />

      {/* Marks the card as something that can be picked up; the card itself is what is grabbed */}
      <div className={styles.handle} aria-hidden>
        <span className={styles.handleDisc}>
          <IconArrowsMove size={HANDLE_ICON_SIZE} stroke={1.5} />
        </span>
      </div>

      {scoring && (
        <div className={styles.sheet}>
          <Button
            size={CONTROL_SIZE}
            h={CHANGE_CHARACTER_BUTTON_HEIGHT}
            fullWidth
            classNames={ART_BUTTON_CLASS_NAMES}
            leftSection={<IconUser size={CONTROL_ICON_SIZE} />}
            onClick={openPicker}
          >
            {t('Buttons.ChangeCharacter')}
          </Button>
          <div className={styles.sheetRow}>
            <div className={styles.grow}>
              <SlotScoringSelect
                size={CONTROL_SIZE}
                aria-label={t('Benchmark')}
                leftSection={(
                  <span className={styles.scoringSelectedValue}>
                    <IconChartBar size={CONTROL_ICON_SIZE} />
                    <span>{selectedScoringLabel}</span>
                  </span>
                )}
                leftSectionWidth='100%'
                leftSectionPointerEvents='none'
                leftSectionProps={{ className: styles.scoringSelectedSection }}
                scoring={scoring}
                onChange={onScoringChange}
                classNames={ART_SELECT_CLASS_NAMES}
              />
            </div>
            <div className={styles.grow}>
              <Button
                size={CONTROL_SIZE}
                fullWidth
                classNames={ART_BUTTON_CLASS_NAMES}
                leftSection={<IconTrash size={CONTROL_ICON_SIZE} />}
                onClick={onRemove}
              >
                {t('Buttons.Remove')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
