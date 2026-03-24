import {
  IconCircleCheckFilled,
  IconCircleXFilled,
} from '@tabler/icons-react'
import { type ValueFormatterParams } from 'ag-grid-community'
import { Tooltip } from '@mantine/core'
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
import { type ScoredRelic } from 'lib/relics/scoreRelics'
import {
  currentLocale,
  localeNumber,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import {
  type Relic,
  type Stat,
} from 'types/relic'
import { isFlat } from 'lib/utils/statUtils'
import { precisionRound, truncate10ths } from 'lib/utils/mathUtils'

export const GRADE_COLORS: Record<number, string> = {
  5: '#efb679',
  4: '#cc52f1',
  3: '#58beed',
  2: '#63e0ac',
  [-1]: '#bdbdbd',
}

// Hoisted style constants for React renderers (used in non-grid contexts like RelicPreview, filterTags)
const ICON_BLOCK_STYLE = { display: 'block' } as const
const EQUIPPED_GREEN_STYLE = { color: '#6de362', display: 'block' } as const
const EQUIPPED_RED_STYLE = { color: '#de5555', display: 'block' } as const

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

  readableStat: (x: ValueFormatterParams<ScoredRelic, StatsValues>) => {
    if (x?.value == null) return ''
    return i18next.t(`common:ShortReadableStats.${x.value}`)
  },

  readablePart: (x: ValueFormatterParams<ScoredRelic, Parts>) => {
    if (x?.value == null) return ''
    return i18next.t(`common:ReadableParts.${x.value}`)
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

  renderGrade: (relic: Relic, highlight4Liners = false) => {
    const color = GRADE_COLORS[relic.grade as keyof typeof GRADE_COLORS] ?? ''
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
          <IconCircleCheckFilled size={16} style={{ ...ICON_BLOCK_STYLE, color: color }} />
        </Tooltip>
      )
    }
    return <CircleIcon color={circleColor} />
  },

  renderEquipped: (equipped: boolean) => {
    return (
      equipped
        ? <IconCircleCheckFilled size={16} style={EQUIPPED_GREEN_STYLE} />
        : <IconCircleXFilled size={16} style={EQUIPPED_RED_STYLE} />
    )
  },
  renderInitialRolls: (relic: Relic) => {
    return relic.initialRolls === 4
      ? <RingedCircle4Icon color={GRADE_COLORS[5]} />
      : Renderer.renderGrade(relic, true)
  },
}
