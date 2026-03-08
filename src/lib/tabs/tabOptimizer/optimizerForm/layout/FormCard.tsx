import { Flex, useMantineTheme } from '@mantine/core'
import {
  defaultPadding,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import {
  CSSProperties,
  ReactElement,
} from 'react'

export const cardShadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'
export const cardShadowNonInset = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em'

const defaultGap = 5

const smallWidth = panelWidth
const narrowWidth = 233
const mediumWidth = 373
const largeWidth = 1183

const dimsBySize: Record<string, number> = {
  small: smallWidth,
  narrow: 233,
  medium: mediumWidth,
  large: largeWidth,
}

export default function FormCard(props: {
  size?: string,
  children?: ReactElement | ReactElement[],
  height?: number,
  style?: CSSProperties,
  justify?: string,
}) {
  const theme = useMantineTheme()

  const size = props.size ?? 'small'
  const width = dimsBySize[size]

  return (
    <Flex
      style={{
        borderRadius: 5,
        backgroundColor: theme.colors.dark[7],
        height: props.height ?? 415,
        padding: props.style?.padding ?? defaultPadding,
        boxShadow: cardShadow,
        overflow: props.style?.overflow,
      }}
      className='hide-scrollbar'
    >
      <Flex
        style={{ width: width }}
        justify={props.justify ?? undefined}
      >
        <Flex
          direction="column"
          style={{ width: width }}
          gap={defaultGap}
          justify={props.justify ?? undefined}
        >
          {props.children}
        </Flex>
      </Flex>
    </Flex>
  )
}
