import type { CSSProperties } from 'react'
import { type Languages } from 'lib/utils/i18nUtils'

function generateStyling(language?: Languages): CSSProperties {
  switch (language) {
    case 'fr_FR':
    case 'pt_BR':
    case 'vi_VN':
      return {
        whiteSpace: 'nowrap',
        fontSize: 13,
        lineHeight: '22px',
      }
    default:
      return {
        whiteSpace: 'nowrap',
      }
  }
}

type RelicStatTextProps = React.HTMLAttributes<HTMLDivElement> & { language?: Languages }

export function RelicStatText(props: RelicStatTextProps) {
  const { language, style, ...rest } = props
  return (
    <div style={{ ...generateStyling(language), ...style as CSSProperties }} {...rest} />
  )
}
