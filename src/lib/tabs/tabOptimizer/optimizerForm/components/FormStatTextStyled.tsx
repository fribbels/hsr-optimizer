import { type HTMLAttributes } from 'react'

const FormStatTextStyled = ({ style, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div style={{ textAlign: 'center', ...style }} {...props} />
)

export default FormStatTextStyled
