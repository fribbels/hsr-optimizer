import { Flex, Image, Tooltip } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import { Constants, StatsToReadableShort } from './constants.ts'
import { Assets } from './assets'
import { Utils } from './utils'
import PropTypes from 'prop-types'

export const Renderer = {
  floor: (x) => {
    if (x == undefined || x.value == undefined) return ''
    return Math.floor(x.value)
  },

  x100Tenths: (x) => {
    if (x == undefined || x.value == undefined) return ''
    return (Math.floor(Utils.precisionRound(x.value * 100) * 10) / 10).toFixed(1)
  },

  tenths: (x) => {
    if (x == undefined || x.value == undefined) return ''
    return (Math.floor(Utils.precisionRound(x.value) * 10) / 10).toFixed(1)
  },

  relicSet: (x) => {
    if (x == undefined || x.value == undefined || isNaN(x.value)) return ''
    const i = x.value

    const count = Object.values(Constants.SetsRelics).length
    const setImages = []

    const s1 = i % count
    const s2 = ((i - s1) / count) % count
    const s3 = ((i - s2 * count - s1) / (count * count)) % count
    const s4 = ((i - s3 * count * count - s2 * count - s1) / (count * count * count)) % count

    const relicSets = [s1, s2, s3, s4]

    while (relicSets.length > 0) {
      const value = relicSets[0]
      if (relicSets.lastIndexOf(value)) {
        const setName = Object.entries(Constants.RelicSetToIndex).find((x) => x[1] == value)[0]
        const assetValue = Assets.getSetImage(setName, Constants.Parts.Head)
        setImages.push(assetValue)

        const otherIndex = relicSets.lastIndexOf(value)
        relicSets.splice(otherIndex, 1)
      }
      relicSets.splice(0, 1)
    }

    setImages.sort()

    return (
      <Flex justify="center" style={{ marginTop: -1 }}>
        <SetDisplay asset={setImages[0]} />
        <SetDisplay asset={setImages[1]} />
      </Flex>
    )
  },

  ornamentSet: (x) => {
    if (x == undefined || x.value == undefined) return ''
    const i = x.value

    const ornamentSetCount = Object.values(Constants.SetsOrnaments).length
    let setImage

    const s1 = i % ornamentSetCount
    const s2 = ((i - s1) / ornamentSetCount) % ornamentSetCount

    if (s1 == s2) {
      const setName = Object.entries(Constants.OrnamentSetToIndex).find((x) => x[1] == s1)[0]
      setImage = Assets.getSetImage(setName, Constants.Parts.PlanarSphere)
      return (
        <Flex justify="center" style={{ marginTop: -1 }}>
          <SetDisplay asset={setImage} />
        </Flex>
      )
    } else {
      return ''
    }
  },

  anySet: (x) => {
    if (x == undefined || x.value == undefined) return ''
    const part = x.data.part

    const src = Assets.getSetImage(x.data.set, part)
    return (
      <Flex justify="center" title={x.data.set} style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  characterIcon: (x) => {
    if (x == undefined || x.value == undefined) return ''
    const equippedBy = x.data.equippedBy
    if (!equippedBy) return ''

    const src = Assets.getCharacterAvatarById(equippedBy)
    return (
      <Flex justify="center" style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  readableStat: (x) => {
    if (x == undefined || x.value == undefined) return ''
    return StatsToReadableShort[x.value]
  },

  readablePart: (x) => {
    if (x == undefined || x.value == undefined) return ''
    return Constants.PartsToReadable[x.value]
  },

  hideZeroes: (x) => {
    return x.value == 0 ? '' : x.value
  },

  hideZeroesFloor: (x) => {
    return x.value == 0 ? '' : Math.floor(x.value)
  },

  // Unverified: 6, Verified: 6.0
  hideZeroes10thsRelicTabSpd: (x) => {
    if (x.value == 0) return ''

    const value = Utils.precisionRound(Math.floor(x.value * 10) / 10)
    return x.data.verified ? value.toFixed(1) : value
  },

  mainValueRenderer: (x) => {
    const part = x.data.part
    if (part == Constants.Parts.Hands || part == Constants.Parts.Head) {
      return x.value == 0 ? '' : Math.floor(x.value)
    }
    return x.value == 0 ? '' : Utils.truncate10ths(x.value)
  },

  hideZeroesX100Tenths: (x) => {
    return x.value == 0 ? '' : Renderer.x100Tenths(x)
  },

  scoreRenderer: (x) => {
    return Math.round(x.value)
  },

  hideNaNAndFloor: (x) => {
    return isNaN(x.value) ? 0 : Math.floor(x.value)
  },
  hideNaNAndFloorPercent: (x) => {
    return (isNaN(x.value) ? 0 : Math.floor(x.value)) + '%'
  },

  renderSubstatNumber: (substat, relic) => {
    if (substat.stat == Constants.Stats.SPD) {
      if (relic.verified) {
        return Utils.truncate10ths(substat.value).toFixed(1)
      }
      return Math.floor(substat.value)
    }

    return Utils.isFlat(substat.stat) ? Math.floor(substat.value) : Utils.truncate10ths(substat.value).toFixed(1)
  },

  renderMainStatNumber: (mainstat) => {
    return Utils.isFlat(mainstat.stat) ? Math.floor(mainstat.value) : Utils.truncate10ths(mainstat.value).toFixed(1)
  },

  renderGradeCell: (x) => {
    const relic = x.data
    return Renderer.renderGrade(relic)
  },
  renderGrade: (relic) => {
    const color = gradeToColor[relic.grade] || ''
    return (
      relic.verified
        ? <Tooltip mouseEnterDelay={0.4} title="Relic substats verified by relic scorer (speed decimals)"><CheckCircleFilled style={{ fontSize: '14px', color: color }} /></Tooltip>
        : <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
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

function SetDisplay(props) {
  if (props.asset) {
    return (
      <Image src={props.asset} width={32} preview={false}>
      </Image>
    )
  } else {
    return ''
  }
}
SetDisplay.propTypes = {
  asset: PropTypes.string,
}
