import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type { SlotInteractions } from 'lib/tabs/tabTeamShowcase/useSlotInteractions'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import type { CSSProperties } from 'react'
import type { CharacterId } from 'types/character'

const HIDDEN_SELECT_STYLE: CSSProperties = { display: 'none' }

/** One hidden select serves every slot, avoiding four copies of the character option list. */
export function SlotPicker({
  slots,
  interactions,
  onSelect,
}: {
  slots: TeamSlots,
  interactions: SlotInteractions,
  onSelect: (index: number, id: CharacterId | null) => void,
}) {
  const { pickerSlot, setPickerSlot } = interactions
  if (pickerSlot == null) return null

  return (
    <CharacterSelect
      key={pickerSlot}
      value={slots[pickerSlot] ?? null}
      onChange={(next) => onSelect(pickerSlot, next)}
      selectStyle={HIDDEN_SELECT_STYLE}
      opened
      onOpenChange={(open) => {
        if (!open) setPickerSlot(null)
      }}
    />
  )
}
