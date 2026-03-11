import { CSSProperties } from 'react'
import { Text, TextProps } from '@mantine/core'
import { Languages } from 'lib/utils/i18nUtils'

function generateStyling(language?: Languages): CSSProperties {
  switch (language) {
    case 'fr_FR':
    case 'pt_BR':
    case 'vi_VN':
      return {
        whiteSpace: 'nowrap',
        letterSpacing: '-0.2px',
        fontSize: 13,
        lineHeight: '22px',
      }
    default:
      return {
        whiteSpace: 'nowrap',
        letterSpacing: '-0.2px',
      }
  }
}

type RelicStatTextProps = TextProps & React.ComponentPropsWithoutRef<'div'> & { language?: Languages }

const RelicStatText = (props: RelicStatTextProps) => {
  const { language, style, ...rest } = props
  return (
    <Text component="div" style={{ ...generateStyling(language), ...style as CSSProperties }} {...rest} />
  )
}

export default RelicStatText
