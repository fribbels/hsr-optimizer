import {
  MouseSensor,
  type ScreenReaderInstructions,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

// Mouse movement separates drag from click; touch delay separates drag from scrolling.
const MOUSE_ACTIVATION_DISTANCE = 4
const TOUCH_ACTIVATION_DELAY = 250
const TOUCH_ACTIVATION_TOLERANCE = 8

// Suppress dnd-kit's keyboard instructions because these drag surfaces are pointer-only.
export const POINTER_DRAG_ACCESSIBILITY: { screenReaderInstructions: ScreenReaderInstructions } = {
  screenReaderInstructions: { draggable: '' },
}

export function usePointerDragSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: MOUSE_ACTIVATION_DISTANCE } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: TOUCH_ACTIVATION_DELAY, tolerance: TOUCH_ACTIVATION_TOLERANCE },
    }),
  )
}
