import {
  useCallback,
  useState,
} from 'react'

/** View-only slot state shared by a layout's grid overlay and pickers */
export interface SlotInteractions {
  /** Slot whose character picker modal is open, null when closed */
  pickerSlot: number | null
  setPickerSlot: (index: number | null) => void
  /** The one card showing its controls; hovering or tapping another card takes it over */
  revealedSlot: number | null
  revealSlot: (index: number) => void
  toggleRevealedSlot: (index: number) => void
  /** Hides the controls if this slot is the one showing them */
  concealSlot: (index: number) => void
}

export function useSlotInteractions(): SlotInteractions {
  const [pickerSlot, setPickerSlot] = useState<number | null>(null)
  const [revealedSlot, setRevealedSlot] = useState<number | null>(null)

  const revealSlot = useCallback((index: number) => setRevealedSlot(index), [])
  const toggleRevealedSlot = useCallback((index: number) => {
    setRevealedSlot((current) => (current === index ? null : index))
  }, [])
  const concealSlot = useCallback((index: number) => {
    setRevealedSlot((current) => (current === index ? null : current))
  }, [])

  return {
    pickerSlot,
    setPickerSlot,
    revealedSlot,
    revealSlot,
    toggleRevealedSlot,
    concealSlot,
  }
}
