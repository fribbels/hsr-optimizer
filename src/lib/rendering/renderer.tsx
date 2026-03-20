import {
  IconCircleCheckFilled,
  IconCircleXFilled,
} from '@tabler/icons-react'
import { type ValueFormatterParams } from 'ag-grid-community'
import { type CustomCellRendererProps } from 'ag-grid-react'
import { Flex, Tooltip } from '@mantine/core'
import i18next from 'i18next'
import { CircleIcon } from 'icons/CircleIcon'
import { RingedCircle4Icon } from 'icons/RingedCircle4Icon'
import { RingedCircleCheckIcon } from 'icons/RingedCircleCheckIcon'
import { RingedCircleIcon } from 'icons/RingedCircleIcon'
import {
  Constants,
  type Parts,
  type StatsValues,
} from 'lib/constants/constants'
import { type OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { type ScoredRelic } from 'lib/relics/scoreRelics'
import { Assets } from 'lib/rendering/assets'
import {
  currentLocale,
  localeNumber,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import {
  type Relic,
  type Stat,
} from 'types/relic'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'
import { isFlat } from 'lib/utils/statUtils'
import { precisionRound, truncate10ths } from 'lib/utils/mathUtils'

const gradeToColor = {
  5: '#efb679',
  4: '#cc52f1',
  3: '#58beed',
  2: '#63e0ac',

  [-1]: '#bdbdbd',
}

function SetDisplay(props: { asset: string }) {
  if (props.asset) {
    return (
      <img src={props.asset} style={{ width: 32 }} />
    )
  } else {
    return ''
  }
}

function formatStatValue(stat: string, value: number): string {
  return isFlat(stat) ? localeNumber(Math.floor(value)) : localeNumber_0(truncate10ths(value))
}

export const Renderer = {
  floor: <T,>(x: ValueFormatterParams<T, number>) => {
    if (x?.value == null) return ''
    return localeNumber(Math.floor(x.value))
  },

  x100Tenths: <T,>(x: ValueFormatterParams<T, number>) => {
    if (x?.value == null) return ''
    return localeNumber_0(Math.floor(precisionRound(x.value * 100) * 10) / 10)
  },

  tenths: <T,>(x: ValueFormatterParams<T, number>) => {
    if (x?.value == null) return ''
    return localeNumber_0(Math.floor(precisionRound(x.value) * 10) / 10)
  },

  relicSet: (x: CustomCellRendererProps<OptimizerDisplayDataStatSim, number>) => {
    if (x?.value == null || isNaN(x.value)) return ''
    const i = x.value

    const count = Object.values(SetsRelics).length
    const setImages: string[] = []

    const s1 = i % count
    const s2 = ((i - s1) / count) % count
    const s3 = ((i - s2 * count - s1) / (count * count)) % count
    const s4 = ((i - s3 * count * count - s2 * count - s1) / (count * count * count)) % count

    const relicSets = [s1, s2, s3, s4]

    while (relicSets.length > 0) {
      const value = relicSets[0]
      if (relicSets.lastIndexOf(value)) {
        const entry = Object.entries(RelicSetToIndex).find((x) => x[1] === value)
        if (!entry) {
          relicSets.splice(0, 1)
          continue
        }
        const setName = entry[0]
        const assetValue = Assets.getSetImage(setName, Constants.Parts.Head)
        setImages.push(assetValue)

        const otherIndex = relicSets.lastIndexOf(value)
        relicSets.splice(otherIndex, 1)
      }
      relicSets.splice(0, 1)
    }

    setImages.sort()

    return (
      <Flex justify='center' style={{ marginTop: -1 }}>
        <SetDisplay asset={setImages[0]} />
        <SetDisplay asset={setImages[1]} />
      </Flex>
    )
  },

  ornamentSet: (x: CustomCellRendererProps<OptimizerDisplayDataStatSim, number>) => {
    if (x?.value == null) return ''
    const i = x.value

    const ornamentSetCount = Object.values(SetsOrnaments).length

    const s1 = i % ornamentSetCount
    const s2 = ((i - s1) / ornamentSetCount) % ornamentSetCount

    if (s1 !== s2) return ''

    const entry = Object.entries(OrnamentSetToIndex).find((x) => x[1] === s1)
    if (!entry) return ''
    const setImage = Assets.getSetImage(entry[0], Constants.Parts.PlanarSphere)

    return (
      <Flex justify='center' style={{ marginTop: -1 }}>
        <SetDisplay asset={setImage} />
      </Flex>
    )
  },

  anySet: (x: CustomCellRendererProps<ScoredRelic>) => {
    const data = x.data
    if (!data) return ''

    const src = Assets.getSetImage(data.set, data.part)
    return (
      <Flex justify='center' title={data.set} style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  characterIcon: (x: CustomCellRendererProps<ScoredRelic>) => {
    const equippedBy = x.data?.equippedBy
    if (!equippedBy) return ''

    const src = Assets.getCharacterAvatarById(equippedBy)
    return (
      <Flex justify='center' style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  readableStat: (x: ValueFormatterParams<ScoredRelic, StatsValues>) => {
    if (x?.value == null) return ''
    return i18next.t(`common:ShortReadableStats.${x.value}`)
  },

  readablePart: (x: ValueFormatterParams<ScoredRelic, Parts>) => {
    if (x?.value == null) return ''
    return i18next.t(`common:ReadableParts.${x.value}`)
  },

  partIcon: <T,>(x: ValueFormatterParams<T, string>) => {
    if (x?.value == null) return ''
    return (
      <Flex justify='center' style={{ marginTop: -1, width: 20, marginBottom: 3 }}>
        <SetDisplay asset={Assets.getPart(x.value)} />
      </Flex>
    )
  },

  hideZeroesFloor: <T,>(x: ValueFormatterParams<T, number>) => {
    return !x.value ? '' : String(Math.floor(x.value))
  },

  // Unverified: 6, Verified: 6.0
  hideZeroes10thsRelicTabSpd: (x: ValueFormatterParams<ScoredRelic, number>) => {
    if (!x.value) return ''

    const value = precisionRound(Math.floor(x.value * 10) / 10)
    return x.data?.verified ? localeNumber_0(value) : localeNumber(value)
  },

  mainValueRenderer: (x: ValueFormatterParams<ScoredRelic, number>) => {
    const part = x.data?.part
    if (part === Constants.Parts.Hands || part === Constants.Parts.Head) {
      return !x.value ? '' : localeNumber(Math.floor(x.value))
    }
    return !x.value ? '' : truncate10ths(x.value).toLocaleString(currentLocale())
  },

  hideZeroesX100Tenths: <T,>(x: ValueFormatterParams<T, number>) => {
    return x.value === 0 ? '' : Renderer.x100Tenths(x)
  },

  hideNaNAndFloor: <T,>(x: ValueFormatterParams<T, number>) => {
    return !x.value || isNaN(x.value) ? '0' : Math.floor(x.value).toLocaleString(currentLocale())
  },

  hideNaNAndFloorPercent: <T,>(x: ValueFormatterParams<T, number>) => {
    const display = !x.value || isNaN(x.value) ? 0 : Math.floor(x.value)
    return display.toLocaleString(currentLocale()) + '%'
  },

  renderSubstatNumber: (substat: Stat, relic: Relic) => {
    if (substat.stat === Constants.Stats.SPD) {
      if (relic.verified) {
        return localeNumber_0(truncate10ths(substat.value))
      }
      return Math.floor(substat.value)
    }

    return formatStatValue(substat.stat, substat.value)
  },

  renderMainStatNumber: (mainstat: Stat) => {
    return formatStatValue(mainstat.stat, mainstat.value)
  },

  renderGradeCell: (x: CustomCellRendererProps<Relic>) => {
    const relic = x.data!
    return Renderer.renderGrade(relic, true)
  },

  renderGrade: (relic: Relic, highlight4Liners = false) => {
    const color = gradeToColor[relic.grade as keyof typeof gradeToColor] ?? ''
    const circleColor = color === '' ? 'transparent' : color
    const is4Liner = highlight4Liners && relic.initialRolls === 4

    if (is4Liner && relic.verified) {
      return (
        <Tooltip
          openDelay={400}
          label={i18next.t('Verified4LinerHoverText')}
          // Relic substats and initial roll count verified by relic scorer (accurate speed decimals + 4 initial substats)
        >
          <RingedCircleCheckIcon color={circleColor} />
        </Tooltip>
      )
    }
    if (is4Liner) return <RingedCircleIcon color={circleColor} />
    if (relic.verified) {
      return (
        <Tooltip
          openDelay={400}
          label={i18next.t('VerifiedRelicHoverText') /* Relic substats verified by relic scorer (speed decimals) */}
        >
          <IconCircleCheckFilled size={16} style={{ color: color, display: 'block' }} />
        </Tooltip>
      )
    }
    return <CircleIcon color={circleColor} />
  },

  renderEquipped: (equipped: boolean) => {
    return (
      equipped
        ? <IconCircleCheckFilled size={16} style={{ color: '#6de362', display: 'block' }} />
        : <IconCircleXFilled size={16} style={{ color: '#de5555', display: 'block' }} />
    )
  },
  renderInitialRolls: (relic: Relic) => {
    return relic.initialRolls === 4
      ? <RingedCircle4Icon color={gradeToColor[5]} />
      : Renderer.renderGrade(relic, true)
  },
}
