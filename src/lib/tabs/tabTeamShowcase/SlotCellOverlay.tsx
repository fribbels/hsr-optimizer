import { Button } from '@mantine/core'
import {
  IconArrowsExchange,
  IconArrowsMove,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import { SlotDragContext } from 'lib/tabs/tabTeamShowcase/slotDrag'
import styles from 'lib/tabs/tabTeamShowcase/SlotCellOverlay.module.css'
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
/** Mantine's md button is 36px; Swap is the main action and gets half again */
const SWAP_BUTTON_HEIGHT = 54
const CONTROL_SIZE = 'md'

/** Mantine ships as layered CSS, so these unlayered module rules win without specificity tricks */
const ART_BUTTON_CLASS_NAMES = { root: styles.artButton }
const ART_SELECT_CLASS_NAMES = { input: styles.artInput, section: styles.artSection }

// TODO(i18n): card controls copy
const BENCHMARK_LABEL = 'Benchmark'
const CARD_LABEL = 'Card options, drag to reorder'

/** A click with no pointer behind it, i.e. keyboard activation, reports zero clicks */
const KEYBOARD_CLICK_DETAIL = 0
const POINTER_DOWN_EVENT = 'pointerdown'

/**
 * Interaction layer covering one card cell of the TeamCardGrid. The cards themselves are inert, so this
 * is the only way to interact with a cell. Empty cells are a dashed add target. Filled cells reveal, on
 * tap (or hover on desktop), a gradient scrim along the bottom carrying Swap, the benchmark select and
 * Remove, and a disc at the centre marking the card as something that can be picked up. Tapping the card
 * never opens the picker on its own: on touch a tap is the only input, and it must not swap a character
 * by accident.
 *
 * The whole card is the drag source. The controls are excluded for free, because the sheet holding them
 * sits above the card-wide target rather than inside it, so a press that lands on a control never
 * reaches the card underneath.
 *
 * While any card is being dragged the controls all step aside, and reveal stops responding to the pointer
 * crossing cards, so the grid does not light up behind the card in flight. The dragged card keeps its
 * grip visible. Dropping is what decides which card is revealed next, so the layout owns that, not this.
 *
 * Only one card is ever revealed. The revealed slot lives in the shared interactions and the newest
 * claim wins: hovering, tapping or focusing a card claims it; leaving it, focusing outside it, or a
 * pointer-down anywhere outside it releases it. Reveal is never driven by CSS focus, because a clicked
 * card keeps focus while another is hovered and both would show. Keyboard activation toggles, so a
 * keyboard user can close the card they are on.
 *
 * The overlay is a sibling of the captured grid element, so it can never appear in the screenshot; it
 * is hidden during a capture anyway so the grid visibly clears while the screenshot is taken.
 */
export function SlotCellOverlay({
  index,
  filled,
  interactions,
  scoring,
  capturing,
  onScoringChange,
  onRemove,
}: {
  index: number,
  filled: boolean,
  interactions: SlotInteractions,
  scoring: SlotScoring | null,
  /** A screenshot is being taken */
  capturing: boolean,
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
  const cellRef = useRef<HTMLDivElement>(null)

  // A pointer-down anywhere outside this card releases it, which is the only way to dismiss on touch
  useEffect(() => {
    if (!revealed) return
    const handlePointerDown = (event: Event) => {
      const cell = cellRef.current
      if (cell && event.target instanceof Node && !cell.contains(event.target)) concealSlot(index)
    }
    document.addEventListener(POINTER_DOWN_EVENT, handlePointerDown)
    return () => document.removeEventListener(POINTER_DOWN_EVENT, handlePointerDown)
  }, [revealed, index, concealSlot])

  const openPicker = () => setPickerSlot(index)

  if (!filled) {
    return (
      <button
        type='button'
        className={styles.emptyCellTarget}
        aria-label={t('Buttons.AddCharacter')}
        onClick={openPicker}
      >
        <span className={styles.emptyCellIcon}>
          <IconPlus size={ADD_ICON_SIZE} />
        </span>
        <span className={styles.emptyCellLabel}>{t('Buttons.AddCharacter')}</span>
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
      data-capturing={capturing}
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
        aria-label={CARD_LABEL}
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
            h={SWAP_BUTTON_HEIGHT}
            fullWidth
            classNames={ART_BUTTON_CLASS_NAMES}
            leftSection={<IconArrowsExchange size={CONTROL_ICON_SIZE} />}
            onClick={openPicker}
          >
            {t('Buttons.Swap')}
          </Button>
          <div className={styles.sheetRow}>
            <div className={styles.grow}>
              <SlotScoringSelect
                size={CONTROL_SIZE}
                aria-label={BENCHMARK_LABEL}
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
