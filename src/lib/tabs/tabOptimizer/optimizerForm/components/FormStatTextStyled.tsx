import type { HTMLAttributes } from 'react'

export const FormStatTextStyled = ({ style, ...props }: HTMLAttributes<HTMLDivElement>) => <div style={{ textAlign: 'center', ...style }} {...props} />
