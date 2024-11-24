import { Typography } from 'antd'
import i18next from 'i18next'
import styled from 'styled-components'

const { Text } = Typography

const RelicStatText = styled(Text)`
    ${generateStyling()}
`

export default RelicStatText

function generateStyling() {
  switch (i18next.resolvedLanguage) {
    case 'fr':
    case 'pt':
      return `
        white-space: nowrap;
        letter-spacing: -0.2px;
        font-size: 14px;
      `
    default:
      return `
        white-space: nowrap;
      `
  }
}
