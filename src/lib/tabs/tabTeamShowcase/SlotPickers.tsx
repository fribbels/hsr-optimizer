import type { SlotInteractions } from 'lib/tabs/tabTeamShowcase/useSlotInteractions'
import type { TeamShowcaseState } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import type { CSSProperties } from 'react'

/** The select's own text input is hidden; only its modal is used */
const HIDDEN_SELECT_STYLE: CSSProperties = { display: 'none' }

/**
 * The character picker modal, opened by setting `interactions.pickerSlot`.
 * Render once anywhere in a layout; it takes no visible space.
 *
 * One select serves every slot, and only while a picker is open. Each CharacterSelect builds its own
 * option list by deep-cloning the character metadata, so mounting one per slot cloned it four times over
 * and redid the work on every roster edit.
 */
export function SlotPickers({ state, interactions }: {
  state: TeamShowcaseState,
  interactions: SlotInteractions,
}) {
  const { slots, setSlot, optionFilter } = state
  const { pickerSlot, setPickerSlot } = interactions

  if (pickerSlot == null) return null

  return (
    <CharacterSelect
      key={pickerSlot}
      value={slots[pickerSlot] ?? null}
      onChange={(next) => setSlot(pickerSlot, next)}
      optionFilter={optionFilter}
      selectStyle={HIDDEN_SELECT_STYLE}
      opened
      onOpenChange={(open) => {
        if (!open) setPickerSlot(null)
      }}
    />
  )
}
