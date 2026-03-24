import {
  IconCircleCheckFilled,
  IconCircleXFilled,
} from '@tabler/icons-react'
import { type ValueFormatterParams } from 'ag-grid-community'
import { type CustomCellRendererProps } from 'ag-grid-react'
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
  OrnamentSetCount,
  RelicSetCount,
  SetsOrnamentsNames,
  SetsRelicsNames,
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

// Hoisted style constants for hot-path cell renderers
const IMG_STYLE_32 = { width: 32 } as const
const CELL_CENTER_STYLE = { display: 'flex', justifyContent: 'center', marginTop: -1 } as const
const PART_ICON_STYLE = { display: 'flex', justifyContent: 'center', marginTop: -1, width: 20, marginBottom: 3 } as const
const ICON_BLOCK_STYLE = { display: 'block' } as const
const EQUIPPED_GREEN_STYLE = { color: '#6de362', display: 'block' } as const
const EQUIPPED_RED_STYLE = { color: '#de5555', display: 'block' } as const

// Precomputed set image URLs — avoids per-render Assets.getSetImage() calls (which allocate partToId + new URL each time)
const relicIndexToImage = SetsRelicsNames.map((name) => Assets.getSetImage(name, Constants.Parts.Head))
const ornamentIndexToImage = SetsOrnamentsNames.map((name) => Assets.getSetImage(name, Constants.Parts.PlanarSphere))

// Pre-warm browser image cache — ensures compressed bytes are in memory cache (not just disk),
// making synchronous decode near-instant when AG Grid creates new <img> elements during scroll
for (const url of relicIndexToImage) { new Image().src = url }
for (const url of ornamentIndexToImage) { new Image().src = url }

function SetDisplay(props: { asset: string }) {
  if (props.asset) {
    return (
      <img src={props.asset} decoding="sync" style={IMG_STYLE_32} />
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
    const count = RelicSetCount

    const s1 = i % count
    const s2 = ((i - s1) / count) % count
    const s3 = ((i - s2 * count - s1) / (count * count)) % count
    const s4 = ((i - s3 * count * count - s2 * count - s1) / (count * count * count)) % count

    // Find 2-piece set pairs from 4 slot indices — direct detection, no allocation
    let img1: string | undefined
    let img2: string | undefined
    if (s1 === s2 || s1 === s3 || s1 === s4) img1 = relicIndexToImage[s1]
    if (s3 === s4 && s3 !== s1) img2 = relicIndexToImage[s3]
    else if (s2 === s3 && s2 !== s1) img2 = relicIndexToImage[s2]
    else if (s2 === s4 && s2 !== s1) img2 = relicIndexToImage[s2]

    // Stable ordering
    if (img1 && img2 && img1 > img2) { const tmp = img1; img1 = img2; img2 = tmp }

    return (
      <div style={CELL_CENTER_STYLE}>
        <SetDisplay asset={img1 ?? ''} />
        <SetDisplay asset={img2 ?? ''} />
      </div>
    )
  },

  ornamentSet: (x: CustomCellRendererProps<OptimizerDisplayDataStatSim, number>) => {
    if (x?.value == null) return ''
    const i = x.value

    const s1 = i % OrnamentSetCount
    const s2 = ((i - s1) / OrnamentSetCount) % OrnamentSetCount

    if (s1 !== s2) return ''

    const setImage = ornamentIndexToImage[s1]
    if (!setImage) return ''

    return (
      <div style={CELL_CENTER_STYLE}>
        <SetDisplay asset={setImage} />
      </div>
    )
  },

  anySet: (x: CustomCellRendererProps<ScoredRelic>) => {
    const data = x.data
    if (!data) return ''

    const src = Assets.getSetImage(data.set, data.part)
    return (
      <div title={data.set} style={CELL_CENTER_STYLE}>
        <SetDisplay asset={src} />
      </div>
    )
  },

  characterIcon: (x: CustomCellRendererProps<ScoredRelic>) => {
    const equippedBy = x.data?.equippedBy
    if (!equippedBy) return ''

    const src = Assets.getCharacterAvatarById(equippedBy)
    return (
      <div style={CELL_CENTER_STYLE}>
        <SetDisplay asset={src} />
      </div>
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
      <div style={PART_ICON_STYLE}>
        <SetDisplay asset={Assets.getPart(x.value)} />
      </div>
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
      ? <RingedCircle4Icon color={gradeToColor[5]} />
      : Renderer.renderGrade(relic, true)
  },
}
