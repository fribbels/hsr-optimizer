import { Text } from '@mantine/core'
import { ComponentType } from 'react'
import { Languages } from 'lib/utils/i18nUtils'
import styled from 'styled-components'

const RelicStatText = styled(Text as ComponentType<any>)<{ language?: Languages }>`
    ${(props) => generateStyling(props.language)}
`

export default RelicStatText

function generateStyling(language?: Languages) {
  switch (language) {
    case 'fr_FR':
    case 'pt_BR':
    case 'vi_VN':
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
