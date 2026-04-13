import { memo, useMemo, type CSSProperties } from 'react'
import { type Languages } from 'lib/utils/i18nUtils'

// Pre-computed styles for languages with longer text
const COMPACT_STYLE: CSSProperties = { whiteSpace: 'nowrap', fontSize: 13, lineHeight: '22px' }
const DEFAULT_STYLE: CSSProperties = { whiteSpace: 'nowrap' }
const LANGUAGE_STYLES: Partial<Record<Languages, CSSProperties>> = {
  fr_FR: COMPACT_STYLE,
  pt_BR: COMPACT_STYLE,
  vi_VN: COMPACT_STYLE,
}

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
