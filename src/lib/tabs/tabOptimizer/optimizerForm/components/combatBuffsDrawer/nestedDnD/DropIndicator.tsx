export function DropIndicator({ active, gap, position }: DropIndicator.Props) {
  if (!active) return null
  return (
    <div
      style={{
        display: active ? 'block' : 'none',
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'red',
        pointerEvents: 'none',
        borderRadius: 1,
        bottom: position === 'lower' ? gap * -0.5 : undefined,
        top: position === 'upper' ? gap * -0.5 : undefined,
        transform: position === 'upper' ? 'translateY(-50%)' : 'translateY(50%)'
      }}
    />
  )
}

export namespace DropIndicator {
  export type Props = {
    active: boolean
    gap: number
    position: 'upper' | 'lower'
  }
}