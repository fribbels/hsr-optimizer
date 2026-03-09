import {
  Flex,
  theme,
} from 'antd'
import { BuffRow } from 'lib/characterPreview/buffsAnalysis/BuffRow'
import {
  DesignContext,
  getCardStyle,
  getIconStyle,
} from 'lib/characterPreview/buffsAnalysis/designContext'
import {
  SetKey,
  Sets,
} from 'lib/constants/constants'
import { Buff } from 'lib/optimization/basicStatsArray'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Assets } from 'lib/rendering/assets'
import { setToId } from 'lib/sets/setConfigRegistry'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { LightConeId } from 'types/lightCone'

function getBuffSourceIcon(id: string, buffType: BUFF_TYPE) {
  if (buffType === BUFF_TYPE.PRIMARY || buffType === BUFF_TYPE.CHARACTER) return Assets.getCharacterAvatarById(id)
  if (buffType === BUFF_TYPE.LIGHTCONE) return Assets.getLightConeIconById(id)
  if (buffType === BUFF_TYPE.SETS) return Assets.getSetImage(Sets[id as SetKey])

  return Assets.getBlank()
}

export function BuffGroup(props: { id: string, buffs: Buff[], buffType: BUFF_TYPE }) {
  const { token } = theme.useToken()
  const options = useContext(DesignContext)
  const { t: tGameData } = useTranslation('gameData')
  const { id, buffs, buffType } = props

  const src = getBuffSourceIcon(id, buffType)
  let name: string
  if (buffType === BUFF_TYPE.PRIMARY || buffType === BUFF_TYPE.CHARACTER) {
    name = tGameData(`Characters.${id as CharacterId}.Name`)
  } else if (buffType === BUFF_TYPE.LIGHTCONE) {
    name = tGameData(`Lightcones.${id as LightConeId}.Name`)
  } else if (buffType === BUFF_TYPE.SETS) {
    name = tGameData(`RelicSets.${setToId[Sets[id as SetKey]]}.Name`)
  } else {
    name = id
  }

  const cardStyleProp = getCardStyle(options, token)
  const iconStyle = getIconStyle(options)

  return (
    <Flex align='center' gap={0} style={cardStyleProp}>
      <img src={src} style={iconStyle} />

      <Flex vertical gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        <CardHeader label={name} />
        {buffs.map((buff, i) => <BuffRow key={i} buff={buff} isLast={i === buffs.length - 1} />)}
      </Flex>
    </Flex>
  )
}

export function CardHeader(props: { label: string }) {
  const options = useContext(DesignContext)
  return (
    <span
      style={{
        padding: `0 ${options.rowPaddingX}px`,
        height: options.rowHeight,
        lineHeight: `${options.rowHeight}px`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: options.fontSize - 1,
        fontWeight: 600,
        color: '#ffffff73',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        borderBottom: '1px solid #ffffff30',
        marginBottom: 2,
      }}
    >
      {props.label}
    </span>
  )
}
