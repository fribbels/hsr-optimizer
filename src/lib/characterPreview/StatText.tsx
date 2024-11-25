import { Typography } from 'antd'
import styled from 'styled-components'

const { Text } = Typography

const StatText = styled(Text)`
    font-family: Segoe UI, Frutiger, Frutiger Linotype, Dejavu Sans, Helvetica Neue, Arial, sans-serif;
    font-size: 17px;
    font-weight: 400;
    white-space: nowrap;
`
export const StatTextEllipses = styled(Text)`
    font-family: Segoe UI, Frutiger, Frutiger Linotype, Dejavu Sans, Helvetica Neue, Arial, sans-serif;
    font-size: 17px;
    font-weight: 400;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`
export const StatTextSm = styled(Text)`
    font-family: Segoe UI, Frutiger, Frutiger Linotype, Dejavu Sans, Helvetica Neue, Arial, sans-serif;
    font-size: 16px;
    font-weight: 400;
    white-space: nowrap;
`

export default StatText
