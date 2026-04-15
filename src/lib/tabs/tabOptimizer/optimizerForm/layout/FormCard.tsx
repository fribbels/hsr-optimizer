import { Flex } from '@mantine/core'
import { defaultPadding } from 'lib/constants/constantsUi'
import { panelWidth } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import type {
  CSSProperties,
  ReactNode,
} from 'react'

const defaultGap = 5

const smallWidth = panelWidth
const mediumWidth = 398
const largeWidth = 1258

const dimsBySize: Record<string, number> = {
  small: smallWidth,
  narrow: 248,
  medium: mediumWidth,
  large: largeWidth,
}

export function FormCard({ size: sizeProp, children, height, style, justify }: {
  size?: string,
  children?: ReactNode,
  height?: number,
  style?: CSSProperties,
  justify?: string,
}) {
  const size = sizeProp ?? 'small'
  const width = dimsBySize[size]

  return (
    <Flex
      style={{
        borderRadius: 6,
        backgroundColor: 'var(--layer-2)',
        height: height ?? 415,
        padding: style?.padding ?? defaultPadding,
        boxShadow: 'var(--shadow-card)',
        overflow: style?.overflow,
      }}
      className='hide-scrollbar'
    >
      <Flex
        style={{ width: width }}
        justify={justify}
      >
        <Flex
          direction='column'
          style={{ width: width }}
          gap={defaultGap}
          justify={justify}
        >
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}
