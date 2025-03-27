import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { Flex, Image, Tooltip } from 'antd'
import i18next from 'i18next'
import { Constants } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { currentLocale, localeNumber, localeNumber_0 } from 'lib/utils/i18nUtils'
import { Utils } from 'lib/utils/utils'
import { Relic, Stat } from 'types/relic'

export const Renderer = {
  floor: (x: { value: number }) => {
    if (x?.value == undefined) return ''
    return localeNumber(Math.floor(x.value))
  },

  x100Tenths: (x: { value: number }) => {
    if (x?.value == undefined) return ''
    return localeNumber_0((Math.floor(Utils.precisionRound(x.value * 100) * 10) / 10))
  },

  tenths: (x: { value: number }) => {
    if (x?.value == undefined) return ''
    return localeNumber_0((Math.floor(Utils.precisionRound(x.value) * 10) / 10))
  },

  relicSet: (x: { value: number }) => {
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
        <SetDisplay asset={setImages[0]}/>
        <SetDisplay asset={setImages[1]}/>
      </Flex>
    )
  },

  ornamentSet: (x: { value: number }) => {
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
          <SetDisplay asset={setImage}/>
        </Flex>
      )
    } else {
      return ''
    }
  },

  anySet: (x: { value: number; data: Relic }) => {
    if (x?.value == undefined) return ''
    const part = x.data.part

    const src = Assets.getSetImage(x.data.set, part)
    return (
      <Flex justify='center' title={x.data.set} style={{ marginTop: -1 }}>
        <SetDisplay asset={src}/>
      </Flex>
    )
  },

  characterIcon: (x: { value: string; data: Relic }) => {
    if (x?.value == undefined) return ''
    const equippedBy = x.data.equippedBy
    if (!equippedBy) return ''

    const src = Assets.getCharacterAvatarById(equippedBy)
    return (
      <Flex justify='center' style={{ marginTop: -1 }}>
        <SetDisplay asset={src}/>
      </Flex>
    )
  },

  readableStat: (x: { value: string }): string => {
    if (x?.value == undefined) return ''
    // @ts-ignore
    return i18next.t(`common:ShortReadableStats.${x.value}`)
  },

  readablePart: (x: { value: string }) => {
    if (x?.value == undefined) return ''
    // @ts-ignore
    return i18next.t(`common:ReadableParts.${x.value}`)
  },

  partIcon: (x: { value: string }) => {
    if (x?.value == undefined) return ''
    return (
      <Flex justify='center' style={{ marginTop: -1, width: 20, marginBottom: 3 }}>
        <SetDisplay asset={Assets.getPart(x.value)}/>
      </Flex>
    )
  },

  hideZeroesFloor: (x: { value: number }) => {
    return x.value == 0 ? '' : '' + Math.floor(x.value)
  },

  // Unverified: 6, Verified: 6.0
  hideZeroes10thsRelicTabSpd: (x: { value: number; data: Relic }) => {
    if (x.value == 0) return ''

    const value = Utils.precisionRound(Math.floor(x.value * 10) / 10)
    return x.data.verified ? value.toFixed(1) : value
  },

  mainValueRenderer: (x: { value: number; data: Relic }) => {
    const part = x.data.part
    if (part == Constants.Parts.Hands || part == Constants.Parts.Head) {
      return x.value == 0 ? '' : localeNumber(Math.floor(x.value))
    }
    return x.value == 0 ? '' : Utils.truncate10ths(x.value).toLocaleString(currentLocale())
  },

  hideZeroesX100Tenths: (x: { value: number }) => {
    return x.value == 0 ? '' : Renderer.x100Tenths(x)
  },

  hideNaNAndFloor: (x: { value: number }) => {
    return isNaN(x.value) ? 0 : Math.floor(x.value)
  },
  hideNaNAndFloorPercent: (x: { value: number }) => {
    return (isNaN(x.value) ? 0 : Math.floor(x.value)) + '%'
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

  renderGradeCell: (x: { data: Relic }) => {
    const relic = x.data
    return Renderer.renderGrade(relic)
  },
  renderGrade: (relic: Relic) => {
    const color = gradeToColor[relic.grade] || ''
    return (
      relic.verified
        ? (
          <Tooltip
            mouseEnterDelay={0.4}
            title={i18next.t('common:VerifiedRelicHoverText')/* Relic substats verified by relic scorer (speed decimals) */}
          >
            <CheckCircleFilled
              style={{ fontSize: '14px', color: color }}
            />
          </Tooltip>
        )
        : (
          <Flex>
            <svg width='14' height='14' viewBox='0 0 14 14' style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <circle cx='7' cy='7' r='7' fill={color == '' ? 'transparent' : color}/>
            </svg>
          </Flex>
        )
    )
  },
  renderEquippedBy: (equippedBy: string) => {
    return (
      equippedBy == 'true'
        ? <CheckCircleFilled style={{ fontSize: '14px', color: '#6de362' }}/>
        : <CloseCircleFilled style={{ fontSize: '14px', color: '#de5555' }}/>
    )
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
