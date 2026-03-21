import { Flex, Tooltip } from '@mantine/core'
import i18next from 'i18next'
import {
  Constants,
  type Parts,
  type Sets,
  Stats,
  type StatsValues,
} from 'lib/constants/constants'
import { setToId } from 'lib/sets/setConfigRegistry'
import { Assets } from 'lib/rendering/assets'
import { Renderer } from 'lib/rendering/renderer'
import { isStatsValues } from 'lib/utils/i18nUtils'
import type { Relic } from 'types/relic'

const TAG_HEIGHT = 34
const IMG_WIDTH = 34

// QOL to colorize elemental stat images instead of using the substat images
const elementOverrides: Record<string, string> = {
  [Stats.Physical_DMG]: 'Physical',
  [Stats.Fire_DMG]: 'Fire',
  [Stats.Ice_DMG]: 'Ice',
  [Stats.Lightning_DMG]: 'Lightning',
  [Stats.Wind_DMG]: 'Wind',
  [Stats.Quantum_DMG]: 'Quantum',
  [Stats.Imaginary_DMG]: 'Imaginary',
}

export function generateTextTags(arr: [key: number, value: string][]) {
  return arr.map((x) => ({
    key: x[0],
    display: (
      <Flex style={{ height: TAG_HEIGHT, justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ fontSize: 18 }}>
          {x[1]}
        </div>
      </Flex>
    ),
  }))
}

export function generateGradeTags(arr: number[]) {
  return arr.map((x) => ({
    key: x,
    display: Renderer.renderGrade({ grade: x } as Relic),
  }))
}

export function generateVerifiedTags(arr: boolean[]) {
  return arr.map((verified) => ({
    key: verified,
    display: Renderer.renderGrade({ grade: -1, verified } as Relic),
  }))
}

export function generateEquippedByTags(arr: boolean[]) {
  return arr.map((equipped) => ({
    key: equipped,
    display: Renderer.renderEquipped(equipped),
  }))
}

export function generateInitialRollsTags(arr: number[]) {
  return arr.map((x) => ({
    key: x,
    display: Renderer.renderInitialRolls({ initialRolls: x, grade: 5 } as Relic),
  }))
}

export function generatePartsTags(keys: Parts[], srcFn: (s: string) => string) {
  return keys.map((key) => ({
    key,
    display: <img style={{ width: IMG_WIDTH }} src={srcFn(key)} />,
  }))
}

export function generateTooltipTags(arr: (Sets | StatsValues)[], srcFn: (s: string) => string, locale: string, flexBasis?: string) {
  return arr.map((x) => ({
    key: x,
    display: generateTooltipDisplay(x, srcFn, locale),
    flexBasis,
  }))
}

function generateTooltipDisplay(key: Sets | StatsValues, srcFn: (s: string) => string, locale: string) {
  const tStats = i18next.getFixedT(locale, 'common', 'Stats')
  const tSets = i18next.getFixedT(locale, 'gameData', 'RelicSets')

  const width = elementOverrides[key] ? 30 : IMG_WIDTH
  const src = elementOverrides[key] ? Assets.getElement(elementOverrides[key]) : srcFn(key)

  return (
    <Tooltip
      label={isStatsValues(key)
        ? tStats(key)
        : tSets(`${setToId[key]}.Name`)}
      openDelay={200}
    >
      <img style={{ width: width }} src={src} />
    </Tooltip>
  )
}

// Re-export constants for use by consumers
export { TAG_HEIGHT, IMG_WIDTH }
export { Constants }
