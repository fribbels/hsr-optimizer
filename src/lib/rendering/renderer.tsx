import {
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons'
import { ValueFormatterParams } from 'ag-grid-community'
import { CustomCellRendererProps } from 'ag-grid-react'
import {
  Flex,
  Image,
  Tooltip,
} from 'antd'
import i18next from 'i18next'
import { CircleIcon } from 'icons/CircleIcon'
import { RingedCircle4Icon } from 'icons/RingedCircle4Icon'
import { RingedCircleCheckIcon } from 'icons/RingedCircleCheckIcon'
import { RingedCircleIcon } from 'icons/RingedCircleIcon'
import {
  Constants,
  Parts,
  StatsValues,
} from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { Assets } from 'lib/rendering/assets'
import {
  currentLocale,
  localeNumber,
  localeNumber_0,
} from 'lib/utils/i18nUtils'
import { Utils } from 'lib/utils/utils'
import { CharacterId } from 'types/character'
import {
  Relic,
  Stat,
} from 'types/relic'

export const Renderer = {
  floor: (x: ValueFormatterParams<any, number>) => {
    if (x?.value == undefined) return ''
    return localeNumber(Math.floor(x.value))
  },

  x100Tenths: (x: ValueFormatterParams<any, number>) => {
    if (x?.value == undefined) return ''
    return localeNumber_0(Math.floor(Utils.precisionRound(x.value * 100) * 10) / 10)
  },

  tenths: (x: ValueFormatterParams<any, number>) => {
    if (x?.value == undefined) return ''
    return localeNumber_0(Math.floor(Utils.precisionRound(x.value) * 10) / 10)
  },

  relicSet: (x: CustomCellRendererProps<OptimizerDisplayDataStatSim, number>) => {
    if (x?.value == undefined || isNaN(x.value)) return ''
    const i = x.value

    const count = Object.values(Constants.SetsRelics).length
    const setImages: string[] = []

    const s1 = i % count
    const s2 = ((i - s1) / count) % count
    const s3 = ((i - s2 * count - s1) / (count * count)) % count
    const s4 = ((i - s3 * count * count - s2 * count - s1) / (count * count * count)) % count

    const relicSets = [s1, s2, s3, s4]

    while (relicSets.length > 0) {
      const value = relicSets[0]
      if (relicSets.lastIndexOf(value)) {
        const setName = Object.entries(Constants.RelicSetToIndex).find((x) => x[1] == value)![0]
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
    if (x?.value == undefined) return ''
    const i = x.value

    const ornamentSetCount = Object.values(Constants.SetsOrnaments).length
    let setImage: string

    const s1 = i % ornamentSetCount
    const s2 = ((i - s1) / ornamentSetCount) % ornamentSetCount

    if (s1 == s2) {
      const setName = Object.entries(Constants.OrnamentSetToIndex).find((x) => x[1] == s1)![0]
      setImage = Assets.getSetImage(setName, Constants.Parts.PlanarSphere)
      return (
        <Flex justify='center' style={{ marginTop: -1 }}>
          <SetDisplay asset={setImage} />
        </Flex>
      )
    } else {
      return ''
    }
  },

  anySet: (x: CustomCellRendererProps<Relic>) => {
    const data = x.data
    if (!data) return ''

    const src = Assets.getSetImage(data.set, data.part)
    return (
      <Flex justify='center' title={data.set} style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  characterIcon: (x: CustomCellRendererProps<Relic>) => {
    const equippedBy = x.data?.equippedBy
    if (!equippedBy) return ''

    const src = Assets.getCharacterAvatarById(equippedBy)
    return (
      <Flex justify='center' style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  readableStat: (x: ValueFormatterParams<Relic, StatsValues>) => {
    if (x?.value == undefined) return ''
    return i18next.t(`common:ShortReadableStats.${x.value}`)
  },

  readablePart: (x: ValueFormatterParams<Relic, Parts>) => {
    if (x?.value == undefined) return ''
    return i18next.t(`common:ReadableParts.${x.value}`)
  },

  partIcon: (x: ValueFormatterParams<any, string>) => {
    if (x?.value == undefined) return ''
    return (
      <Flex justify='center' style={{ marginTop: -1, width: 20, marginBottom: 3 }}>
        <SetDisplay asset={Assets.getPart(x.value)} />
      </Flex>
    )
  },

  hideZeroesFloor: (x: ValueFormatterParams<any, number>) => {
    return !x.value ? '' : '' + Math.floor(x.value)
  },

  // Unverified: 6, Verified: 6.0
  hideZeroes10thsRelicTabSpd: (x: ValueFormatterParams<Relic, number>) => {
    if (!x.value) return ''

    const value = Utils.precisionRound(Math.floor(x.value * 10) / 10)
    return x.data?.verified ? localeNumber_0(value) : localeNumber(value)
  },

  mainValueRenderer: (x: ValueFormatterParams<Relic, number>) => {
    const part = x.data?.part
    if (part == Constants.Parts.Hands || part == Constants.Parts.Head) {
      return !x.value ? '' : localeNumber(Math.floor(x.value))
    }
    return !x.value ? '' : Utils.truncate10ths(x.value).toLocaleString(currentLocale())
  },

  hideZeroesX100Tenths: (x: ValueFormatterParams<any, number>) => {
    return x.value == 0 ? '' : Renderer.x100Tenths(x)
  },

  hideNaNAndFloor: (x: ValueFormatterParams) => {
    return !x.value || isNaN(x.value) ? '0' : Math.floor(x.value).toLocaleString(currentLocale())
  },
  hideNaNAndFloorPercent: (x: ValueFormatterParams) => {
    return (!x.value || isNaN(x.value) ? '0' : Math.floor(x.value)).toLocaleString(currentLocale()) + '%'
  },

  renderSubstatNumber: (substat: Stat, relic: Relic) => {
    if (substat.stat == Constants.Stats.SPD) {
      if (relic.verified) {
        return localeNumber_0(Utils.truncate10ths(substat.value))
      }
      return Math.floor(substat.value)
    }

    return Utils.isFlat(substat.stat) ? localeNumber(Math.floor(substat.value)) : localeNumber_0(Utils.truncate10ths(substat.value))
  },

  renderMainStatNumber: (mainstat: Stat) => {
    return Utils.isFlat(mainstat.stat) ? localeNumber(Math.floor(mainstat.value)) : localeNumber_0(Utils.truncate10ths(mainstat.value))
  },

  renderGradeCell: (x: CustomCellRendererProps<Relic>) => {
    const relic = x.data!
    return Renderer.renderGrade(relic, true)
  },
  renderGrade: (relic: Relic, highlight4Liners = false) => {
    const color = gradeToColor[relic.grade as keyof typeof gradeToColor] ?? ''
    const circleColor = color == '' ? 'transparent' : color
    if (highlight4Liners && relic.initialRolls == 4) {
      return relic.verified
        ? (
          <Tooltip
            mouseEnterDelay={0.4}
            title={i18next.t('Verified4LinerHoverText')}
            // Relic substats and initial roll count verified by relic scorer (accurate speed decimals + 4 initial substats)
          >
            <RingedCircleCheckIcon color={circleColor} />
          </Tooltip>
        )
        : <RingedCircleIcon color={circleColor} />
    } else {
      return relic.verified
        ? (
          <Tooltip
            mouseEnterDelay={0.4}
            title={i18next.t('VerifiedRelicHoverText') /* Relic substats verified by relic scorer (speed decimals) */}
          >
            <CheckCircleFilled style={{ fontSize: '14px', color: color }} />
          </Tooltip>
        )
        : <CircleIcon color={circleColor} />
    }
  },
  renderEquipped: (equipped: boolean) => {
    return (
      equipped
        ? <CheckCircleFilled style={{ fontSize: '14px', color: '#6de362' }} />
        : <CloseCircleFilled style={{ fontSize: '14px', color: '#de5555' }} />
    )
  },
  renderInitialRolls: (relic: Relic) => {
    return relic.initialRolls == 4
      ? <RingedCircle4Icon color={gradeToColor[5]} />
      : Renderer.renderGrade(relic, true)
  },
}

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
      <Image src={props.asset} width={32} preview={false}>
      </Image>
    )
  } else {
    return ''
  }
}
