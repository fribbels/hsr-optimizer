import { type Ref } from 'react'
import classes from './dragHandle.module.css'

export function DragHandle({ ref, onClick }: {
  ref: Ref<HTMLButtonElement> | undefined,
  onClick?: () => void,
}) {
  return (
    <button
      type='button'
      aria-label='Drag to reorder'
      className={classes.handle}
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </button>
  )
}
