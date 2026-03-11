export function PartitionDivider(props: { bottom?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: props.bottom ? undefined : -1,
        bottom: props.bottom ? 0 : undefined,
        left: 0,
        right: 0,
        borderTop: '1px solid var(--border-color)',
        pointerEvents: 'none',
      }}
    />
  )
}
