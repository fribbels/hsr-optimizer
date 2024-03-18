import { Flex, Image, Tooltip } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import { Constants } from './constants.ts'
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
    let i = x.value

    let count = Object.values(Constants.SetsRelics).length
    let setImages = []

    let s1 = i % count
    let s2 = ((i - s1) / count) % count
    let s3 = ((i - s2 * count - s1) / (count * count)) % count
    let s4 = ((i - s3 * count * count - s2 * count - s1) / (count * count * count)) % count

    let relicSets = [s1, s2, s3, s4]

    while (relicSets.length > 0) {
      let value = relicSets[0]
      if (relicSets.lastIndexOf(value)) {
        let setName = Object.entries(Constants.RelicSetToIndex).find((x) => x[1] == value)[0]
        let assetValue = Assets.getSetImage(setName, Constants.Parts.Head)
        setImages.push(assetValue)

        let otherIndex = relicSets.lastIndexOf(value)
        relicSets.splice(otherIndex, 1)
      }
      relicSets.splice(0, 1)
    }

    return (
      <Flex justify="center" style={{ marginTop: -1 }}>
        <SetDisplay asset={setImages[0]} />
        <SetDisplay asset={setImages[1]} />
      </Flex>
    )
  },

  ornamentSet: (x) => {
    if (x == undefined || x.value == undefined) return ''
    let i = x.value

    let ornamentSetCount = Object.values(Constants.SetsOrnaments).length
    let setImage

    let s1 = i % ornamentSetCount
    let s2 = ((i - s1) / ornamentSetCount) % ornamentSetCount

    if (s1 == s2) {
      let setName = Object.entries(Constants.OrnamentSetToIndex).find((x) => x[1] == s1)[0]
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
    let part = x.data.part

    let src = Assets.getSetImage(x.data.set, part)
    return (
      <Flex justify="center" title={x.data.set} style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  characterIcon: (x) => {
    if (x == undefined || x.value == undefined) return ''
    let equippedBy = x.data.equippedBy
    if (!equippedBy) return ''

    let src = Assets.getCharacterAvatarById(equippedBy)
    return (
      <Flex justify="center" style={{ marginTop: -1 }}>
        <SetDisplay asset={src} />
      </Flex>
    )
  },

  readableStat: (x) => {
    if (x == undefined || x.value == undefined) return ''
    return Constants.StatsToReadable[x.value]
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

  hideZeroes10ths: (x) => {
    return x.value == 0 ? '' : Utils.precisionRound(Math.floor(x.value * 10) / 10)
  },

  mainValueRenderer: (x) => {
    let part = x.data.part
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

  hideNaNAndRound: (x) => {
    return isNaN(x.value) ? 0 : Math.round(x.value)
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
    let relic = x.data
    return Renderer.renderGrade(relic)
  },
  renderGrade: (relic) => {
    let color = gradeToColor[relic.grade] || ''
    return (
      relic.verified
        ? <Tooltip mouseEnterDelay={0.4} title="Relic stats verified by relic scorer"><CheckCircleFilled style={{ fontSize: '14px', color: color }} /></Tooltip>
        : <div style={{ width: 14, height: 14, borderRadius: '50%', background: color }} />
    )
  },
}

let gradeToColor = {
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
