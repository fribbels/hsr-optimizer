import {
  type KatexOptions,
  render,
} from 'katex'
import {
  type CSSProperties,
  useEffect,
  useRef,
} from 'react'

export interface KatexProps {
  tex: string
  options?: KatexOptions
  style?: CSSProperties
}
const defaultOptions: KatexOptions = {
  output: 'mathml',
  displayMode: true,
  trust: true,
}
export function Katex({ tex, options: optionsProp, style }: KatexProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const options = { ...defaultOptions, ...optionsProp }
    if (ref.current) render(tex, ref.current, options)
  }, [tex, optionsProp])
  return <div ref={ref} style={style} />
}
