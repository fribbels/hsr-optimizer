import {
  MouseSensor,
  type ScreenReaderInstructions,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'

/**
 * The sensor setup both drags on this tab share: the cards in the grid and the teams in the saved list.
 *
 * Mouse and touch are told apart rather than handled as one pointer, because the thing being dragged is
 * also the thing being clicked. A mouse drags once it has travelled a few pixels, which leaves a plain
 * click free to do what it always did. Touch waits for a short press instead, because a finger that moves
 * straight away is scrolling; reading that as a drag would trap the page under it.
 */
const MOUSE_ACTIVATION_DISTANCE = 4
const TOUCH_ACTIVATION_DELAY = 250
/** How far a finger may stray during the press without it being read as a scroll instead */
const TOUCH_ACTIVATION_TOLERANCE = 8

/**
 * Dragging here is pointer-only, so dnd-kit's stock instructions, which tell the user to press space,
 * would describe something that does not exist.
 */
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
