import { type TFunction } from 'i18next'
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
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import type { OptimizerContext } from 'types/optimizer'

type EnemyRow = { label: string, value: string }

function formatEnemyRows(
  context: OptimizerContext,
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.BuffsAnalysisDisplay.EnemyConfiguration'>,
  tCommon: TFunction<'common'>,
): EnemyRow[] {
  return [
    { label: t('Level'), value: `${context.enemyLevel}` },
    { label: t('Res'), value: `${(context.enemyDamageResistance * 100).toFixed(0)}%` },
    { label: t('Efres'), value: `${(context.enemyEffectResistance * 100).toFixed(0)}%` },
    { label: t('Toughness'), value: `${context.enemyMaxToughness}` },
    { label: t('Targets'), value: `${context.enemyCount}` },
    { label: t('Weakness'), value: context.enemyElementalWeak ? tCommon('Yes') : tCommon('No') },
    { label: t('Broken'), value: context.enemyWeaknessBroken ? tCommon('Yes') : tCommon('No') },
  ]
}

export function EnemyPanel({ avatarSrc, context }: {
  avatarSrc: string,
  context: OptimizerContext,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay.EnemyConfiguration' })
  const { t: tCommon } = useTranslation('common')
  const options = useContext(DesignContext)
  const rowBase = getRowBaseStyle(options)
  const sourceLabelStyle = getSourceLabelStyle(options)
  const rows = formatEnemyRows(context, t, tCommon)

  return (
    <CardShell avatarSrc={avatarSrc}>
      <CardHeader label='ENEMY' />
      {rows.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            ...rowBase,
            borderBottom: i < rows.length - 1 ? `1px solid ${options.borderColor}` : undefined,
          }}
        >
          <span style={{ minWidth: 60, fontSize: options.fontSize, textWrap: 'nowrap' }}>
            {row.value}
          </span>
          <span style={ellipsisStyle(options.fontSize)}>{row.label}</span>
          <span style={sourceLabelStyle}>
            {t('Enemy')}
          </span>
        </div>
      ))}
    </CardShell>
  )
}
