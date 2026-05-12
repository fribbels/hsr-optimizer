import type React from 'react'

type MathMLProps = React.DetailedHTMLProps<React.HTMLAttributes<MathMLElement>, MathMLElement>
type MathElementProps = MathMLProps & { display?: 'block' | 'inline' }

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      math: MathElementProps
      mfrac: MathMLProps
      mi: MathMLProps
      mn: MathMLProps
      mo: MathMLProps
      mrow: MathMLProps
      msub: MathMLProps
      msup: MathMLProps
      mtext: MathMLProps
      munder: MathMLProps
    }
  }
}
