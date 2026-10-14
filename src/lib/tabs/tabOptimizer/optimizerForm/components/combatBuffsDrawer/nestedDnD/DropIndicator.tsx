import type { CSSProperties } from 'react'
import classes from './DropIndicator.module.css'

export function DropIndicator({ active, gap, position }: DropIndicator.Props) {
  if (!active) return null
  return (
    <div
      className={`${classes.indicator} ${classes[position]}`}
      style={{ '--drop-offset': `${gap * -0.5}px` } as CSSProperties}
    />
  )
}

export namespace DropIndicator {
  export type Props = {
    active: boolean,
    gap: number,
    position: 'upper' | 'lower',
  }
}
