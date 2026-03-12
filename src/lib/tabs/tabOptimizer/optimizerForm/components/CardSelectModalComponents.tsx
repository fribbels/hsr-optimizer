import { Flex, Text, UnstyledButton, useMantineTheme } from '@mantine/core'
import {
  ElementName,
  ElementToDamage,
  PathName,
  PathNames,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { ReactElement } from 'react'
import classes from './CardSelectModalComponents.module.css'

const parentW = 100
const parentH = 150

export function CardGridItemContent({ imgSrc, text, innerW, innerH, rows }: {
  imgSrc: string
  text: string
  innerW: number
  innerH: number
  rows: number
}) {
  return (
    <div>
      <img
        width={innerW}
        src={imgSrc}
        style={{
          transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)`,
        }}
      />
      <Text
        component="div"
        lineClamp={rows}
        className={classes.cardTextOverlay}
        style={{ height: 18 * rows }}
      >
        <div
          className={classes.cardTextInner}
          style={{ maxHeight: 18 * rows }}
        >
          {text}
        </div>
      </Text>
    </div>
  )
}

export function generatePathTags() {
  return Object.keys(PathNames).map((x) => {
    return {
      key: x as PathName,
      display: <img className={classes.pathImage} src={Assets.getPath(x)} />,
    }
  })
}

export function generateRarityTags() {
  return [5, 4, 3].map((x) => ({
    key: x,
    display: (
      <Flex flex={1} justify='center' align='center' className={classes.rarityContainer}>
        {Array.from({ length: x }, (_, i) => (
          <img key={i} className={classes.starImage} src={Assets.getStar()} />
        ))}
      </Flex>
    ),
  }))
}

export function generateElementTags() {
  return Object.keys(ElementToDamage).map((x) => {
    return {
      key: x as ElementName,
      display: <img className={classes.elementImage} src={Assets.getElement(x)} />,
    }
  })
}

export function SegmentedFilterRow<T extends string | number | boolean>({
  tags,
  currentFilter,
  setCurrentFilters,
  flexBasis,
  noHeight,
}: {
  tags: { key: T, display: ReactElement, flexBasis?: string }[]
  currentFilter: NoInfer<T>[]
  setCurrentFilters(filters: NoInfer<T>[]): void
  flexBasis?: string
  noHeight?: boolean
}) {
  const theme = useMantineTheme()

  const handleChange = (tag: T, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...currentFilter, tag]
      : currentFilter.filter((t) => t != tag)

    setCurrentFilters(nextSelectedTags)
  }

  return (
    <Flex
      style={{
        flexWrap: 'wrap',
        flexGrow: 1,
        backgroundColor: 'var(--mantine-color-dark-7)',
        boxShadow: '0px 0px 0px 1px var(--border-color) inset',
        borderRadius: 6,
        overflow: 'hidden',
        height: noHeight ? undefined : 40,
      }}
    >
      {tags.map((tag) => (
        <UnstyledButton
          key={tag.key.toString()}
          onClick={() => handleChange(tag.key, !currentFilter.includes(tag.key))}
          style={{
            flex: 1,
            flexBasis: tag.flexBasis ?? flexBasis,
            boxShadow: '1px 1px 1px 0px var(--border-color)',
            backgroundColor: currentFilter.includes(tag.key) ? theme.colors.blue[6] : 'transparent',
          }}
        >
          <Flex align='center' justify='space-around' className={classes.segmentedFilterInner}>
            {tag.display}
          </Flex>
        </UnstyledButton>
      ))}
    </Flex>
  )
}
