import type React from 'react'

type MathMLProps = React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: MathMLProps
      mfrac: MathMLProps
      mi: MathMLProps
      mn: MathMLProps
      mo: MathMLProps
      mrow: MathMLProps
      msub: MathMLProps
      mtext: MathMLProps
    }
  }
}
