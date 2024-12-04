import { Typography } from 'antd'
import { languages } from 'lib/i18n/i18n'
import styled from 'styled-components'

const { Text } = Typography

const RelicStatText = styled(Text)<{ language?: keyof typeof languages }>`
    ${(props) => generateStyling(props.language)}
`

export default RelicStatText

function generateStyling(language?: keyof typeof languages) {
  switch (language) {
    case 'fr':
    case 'pt':
      return `
        white-space: nowrap;
        letter-spacing: -0.2px;
        font-size: 13px;
        line-height: 22px;
      `
    default:
      return `
        white-space: nowrap;
      `
  }
}
