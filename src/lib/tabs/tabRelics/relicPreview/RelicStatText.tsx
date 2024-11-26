import { Typography } from 'antd'
import styled from 'styled-components'

const { Text } = Typography

const RelicStatText = styled(Text)<{ language?: string }>`
    ${(props) => generateStyling(props.language)}
`

export default RelicStatText

function generateStyling(language?: string) {
  switch (language) {
    case 'fr':
    case 'pt':
      return `
        white-space: nowrap;
        letter-spacing: -0.2px;
        font-size: 13px;
      `
    default:
      return `
        white-space: nowrap;
      `
  }
}
