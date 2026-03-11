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

export const CardGridItemContent = (props: {
  imgSrc: string,
  text: string,
  innerW: number,
  innerH: number,
  rows: number,
}) => {
  return (
    <div>
      <img
        width={props.innerW}
        src={props.imgSrc}
        style={{
          transform: `translate(${(props.innerW - parentW) / 2 / props.innerW * -100}%, ${(props.innerH - parentH) / 2 / props.innerH * -100}%)`,
        }}
      />
      <Text
        component="div"
        lineClamp={props.rows}
        className={classes.cardTextOverlay}
        style={{ height: 18 * props.rows }}
      >
        <div
          className={classes.cardTextInner}
          style={{ maxHeight: 18 * props.rows }}
        >
          {props.text}
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
  return [5, 4, 3].map((x) => {
    const stars: ReactElement[] = []
    for (let i = 0; i < x; i++) {
      stars.push(<img key={i} className={classes.starImage} src={Assets.getStar()} />)
    }
    return {
      key: x,
      display: (
        <Flex flex={1} justify='center' align='center' className={classes.rarityContainer}>
          {stars}
        </Flex>
      ),
    }
  })
}

export function generateElementTags() {
  return Object.keys(ElementToDamage).map((x) => {
    return {
      key: x as ElementName,
      display: <img className={classes.elementImage} src={Assets.getElement(x)} />,
    }
  })
}

export function SegmentedFilterRow<T extends string | number | boolean>(props: {
  tags: { key: T, display: ReactElement, flexBasis?: string }[],
  currentFilter: NoInfer<T>[],
  setCurrentFilters(filters: NoInfer<T>[]): void,
  flexBasis?: string,
  noHeight?: boolean,
}) {
  const theme = useMantineTheme()
  const { currentFilter, flexBasis, tags, setCurrentFilters } = props

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
        height: props.noHeight ? undefined : 40,
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
