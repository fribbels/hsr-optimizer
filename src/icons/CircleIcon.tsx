const IconSVG = (props: { color?: string }) => {
  const { color } = props

  return (
    <svg width='14' height='14' viewBox='0 0 14 14' style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx='7' cy='7' r='7' fill={color === '' ? 'transparent' : color} />
    </svg>
  )
}

export const CircleIcon = ({ color }: { color?: string }) => <IconSVG color={color} />
