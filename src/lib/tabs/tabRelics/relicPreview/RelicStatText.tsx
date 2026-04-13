import { memo, useMemo, type CSSProperties } from 'react'
import { type Languages } from 'lib/utils/i18nUtils'

// Pre-computed styles
const LANGUAGE_STYLES: Record<string, CSSProperties> = {
  fr_FR: { whiteSpace: 'nowrap', fontSize: 13, lineHeight: '22px' },
  pt_BR: { whiteSpace: 'nowrap', fontSize: 13, lineHeight: '22px' },
  vi_VN: { whiteSpace: 'nowrap', fontSize: 13, lineHeight: '22px' },
}
const DEFAULT_STYLE: CSSProperties = { whiteSpace: 'nowrap' }

type RelicStatTextProps = React.HTMLAttributes<HTMLDivElement> & { language?: Languages }

export const RelicStatText = memo(function RelicStatText(props: RelicStatTextProps) {
  const { language, style, ...rest } = props
  const baseStyle = language ? (LANGUAGE_STYLES[language] ?? DEFAULT_STYLE) : DEFAULT_STYLE

  const mergedStyle = useMemo(
    () => (style ? { ...baseStyle, ...style as CSSProperties } : baseStyle),
    [baseStyle, style],
  )

  return <div style={mergedStyle} {...rest} />
})
