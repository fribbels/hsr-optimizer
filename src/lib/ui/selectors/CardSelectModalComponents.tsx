import { Flex, UnstyledButton } from '@mantine/core'
import {
  type ElementName,
  ElementToDamage,
  type PathName,
  PathNames,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import type { ReactElement } from 'react'
import classes from './CardSelectModalComponents.module.css'

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
  const handleChange = (tag: T, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...currentFilter, tag]
      : currentFilter.filter((t) => t !== tag)

    setCurrentFilters(nextSelectedTags)
  }

  return (
    <Flex
      style={{
        flexWrap: 'wrap',
        flexGrow: 1,
        backgroundColor: 'var(--layer-2)',
        boxShadow: '0px 0px 0px 1px var(--border-default) inset',
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
            boxShadow: '1px 1px 1px 0px var(--border-default)',
            backgroundColor: currentFilter.includes(tag.key) ? 'var(--primary-default)' : 'transparent',
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
