import { Text } from '@mantine/core'
import { ComponentType } from 'react'
import styled from 'styled-components'

export const HeaderText = styled(Text as ComponentType<any>)`
    text-decoration: underline;
    text-decoration-color: #6d97ffb3;
    text-underline-offset: 2px;
    white-space: nowrap;
`
