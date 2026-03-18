import { Flex } from 'antd'
import {
  CardHeader,
  CardShell,
} from 'lib/characterPreview/buffsAnalysis/BuffGroup'
import {
  DesignContext,
  ellipsisStyle,
  getRowBaseStyle,
  getSourceLabelStyle,
} from 'lib/characterPreview/buffsAnalysis/designContext'
import React, { useContext } from 'react'
import { OptimizerContext } from 'types/optimizer'

type EnemyRow = { label: string; value: string }

function formatEnemyRows(context: OptimizerContext): EnemyRow[] {
  return [
    { label: 'Enemy level', value: `${context.enemyLevel}` },
    { label: 'DMG RES', value: `${(context.enemyDamageResistance * 100).toFixed(0)}%` },
    { label: 'Effect RES', value: `${(context.enemyEffectResistance * 100).toFixed(0)}%` },
    { label: 'Toughness', value: `${context.enemyMaxToughness}` },
    { label: 'Targets', value: `${context.enemyCount}` },
    { label: 'Elemental weakness', value: context.enemyElementalWeak ? 'Yes' : 'No' },
    { label: 'Weakness broken', value: context.enemyWeaknessBroken ? 'Yes' : 'No' },
  ]
}

export function EnemyPanel(props: {
  avatarSrc: string
  context: OptimizerContext
}) {
  const options = useContext(DesignContext)
  const rowBase = getRowBaseStyle(options)
  const sourceLabelStyle = getSourceLabelStyle(options)
  const rows = formatEnemyRows(props.context)

  return (
    <CardShell avatarSrc={props.avatarSrc}>
      <CardHeader label='ENEMY' />
      {rows.map((row, i) => (
        <Flex
          key={row.label}
          align='center'
          gap={6}
          style={{
            ...rowBase,
            borderBottom: i < rows.length - 1 ? `1px solid ${options.borderColor}` : undefined,
          }}
        >
          <span style={{ minWidth: 60, fontSize: options.fontSize, textWrap: 'nowrap' }}>
            {row.value}
          </span>
          <span style={{ ...ellipsisStyle(options.fontSize) }}>{row.label}</span>
          <span style={sourceLabelStyle}>
            Enemy
          </span>
        </Flex>
      ))}
    </CardShell>
  )
}
