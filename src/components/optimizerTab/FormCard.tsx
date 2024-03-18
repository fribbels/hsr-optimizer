import { Flex } from 'antd'
import { CSSProperties, ReactElement } from 'react'

const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

const panelWidth = 203
const defaultGap = 5
const defaultPadding = 15

const smallWidth = panelWidth
const mediumWidth = 365

export default function FormCard(props: { size?: string; children?: ReactElement | ReactElement[]; height?: number; style?: CSSProperties; justify?: string }) {
  const width = props.size == 'medium' ? mediumWidth : smallWidth

  return (
    <Flex
      style={{
        borderRadius: 5,
        backgroundColor: '#243356',
        height: props.height || 350,
        padding: defaultPadding,
        boxShadow: shadow,
        overflow: props.style?.overflow,
      }}
    >
      <Flex
        vertical
        style={{ width: width }}
        gap={defaultGap}
        justify={props.justify || undefined}
      >
        {props.children}
      </Flex>
    </Flex>
  )
}
