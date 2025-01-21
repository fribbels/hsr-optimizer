import { Typography } from 'antd'
import { Languages } from 'lib/i18n/i18n'
import styled from 'styled-components'

const { Text } = Typography

const RelicStatText = styled(Text)<{ language?: Languages }>`
    ${(props) => generateStyling(props.language)}
`

export default RelicStatText

function generateStyling(language?: Languages) {
  switch (language) {
    case 'fr_FR':
    case 'pt_BR':
      return `
        white-space: nowrap;
        letter-spacing: -0.2px;
        font-size: 13px;
        line-height: 22px;
      `
    default:
      return `
        white-space: nowrap;
        letter-spacing: -0.2px;
      `
  }
}
