import {
  useCallback,
  useState,
} from 'react'

/** View-only slot state shared by a layout's grid overlay, slot controls, and pickers */
export interface SlotInteractions {
  /** Slot whose character picker modal is open, null when closed */
  pickerSlot: number | null
  setPickerSlot: (index: number | null) => void
  /** Slot hovered in the grid or in a slot control, so its counterpart can be highlighted */
  hoveredSlot: number | null
  hoverStart: (index: number) => void
  hoverEnd: (index: number) => void
}

export function useSlotInteractions(): SlotInteractions {
  const [pickerSlot, setPickerSlot] = useState<number | null>(null)
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null)

  const hoverStart = useCallback((index: number) => setHoveredSlot(index), [])
  const hoverEnd = useCallback((index: number) => {
    setHoveredSlot((current) => (current === index ? null : current))
  }, [])

  return { pickerSlot, setPickerSlot, hoveredSlot, hoverStart, hoverEnd }
}
