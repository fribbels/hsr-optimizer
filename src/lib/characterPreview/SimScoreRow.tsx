import { StatRowDivider } from 'lib/characterPreview/StatRow'
import type { AKeyValue } from 'lib/optimization/engine/config/keys'
import { Assets } from 'lib/rendering/assets'
import {
  resolveComboLabel,
  SCORING_CONFIG_REGISTRY,
} from 'lib/scoring/scoringConfig'
import { formatSimScore } from 'lib/scoring/simScoringUtils'
import iconClasses from 'style/icons.module.css'
import type { ScoringConfigType } from 'types/metadata'

export function SimScoreRow({ value, configType, buffStat }: {
  value: number,
  configType: ScoringConfigType,
  buffStat?: AKeyValue,
}) {
  const config = SCORING_CONFIG_REGISTRY[configType]
  const label = resolveComboLabel(config, buffStat)
  const valueText = formatSimScore(value, buffStat, 1, config.thousands)
  const titleText = formatSimScore(value, buffStat, 3, config.thousands)

  return (
    <div
      title={titleText}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}
    >
      <img src={Assets.getStatIcon('simScore')} className={iconClasses.statIconSpaced} />
      {label}
      <StatRowDivider />
      {valueText}
    </div>
  )
}
