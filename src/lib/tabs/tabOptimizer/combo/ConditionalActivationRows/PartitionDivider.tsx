export function PartitionDivider({ bottom }: { bottom?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: bottom ? undefined : -1,
        bottom: bottom ? 0 : undefined,
        left: 0,
        right: 0,
        borderTop: '1px solid var(--border-default)',
        pointerEvents: 'none',
      }}
    />
  )
}
