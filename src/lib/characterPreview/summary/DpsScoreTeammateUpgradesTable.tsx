import {
  Tooltip,
} from '@mantine/core'
import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import {
  getTeammateOption,
  isRelicOption,
} from 'lib/sets/setConfigRegistry'
import {
  groupTeammateSetUpgrades,
  type PreTeammateSetUpgrade,
} from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { TeammateUpgrades } from 'lib/tabs/tabOptimizer/analysis/TeammateUpgrades'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const DpsScoreTeammateUpgradesTable = memo(function DpsScoreTeammateUpgradesTable() {
  const result = useSimScoringContext(ScoringSelector.Upgrades)

  if (!result) return null

  const form = result.simulationForm

  const inputs: PreTeammateSetUpgrade[] = result.teammateOrnamentUpgradeResults.map((upgrade) => ({
    id: form[upgrade.teammate!].characterId,
    set: upgrade.set!,
    oldSet: form[upgrade.teammate!].teamOrnamentSet,
    simScore: upgrade.simulationResult.simScore,
  }))

  const groupedUpgrades = groupTeammateSetUpgrades(inputs)

  return (
    <TeammateUpgrades
      groupedUpgrades={groupedUpgrades}
      baseSimScore={result.originalSimScore}
      variant="characters"
    />
  )
})

export function TeammateSetImageWithTooltip({ value, removed }: { value: string, removed?: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const height = iconSize
  const width = iconSize
  const option = getTeammateOption(value)
  if (!option) return null
  const desc = option.desc(t)
  return (
    <Tooltip label={desc}>
      <div style={{ display: 'flex', gap: 3, opacity: removed ? 0.5 : undefined }}>
        <img src={Assets.getSetImage(value)} style={{ width, height }} />
        {isRelicOption(value) && <img src={Assets.getSetImage(value)} style={{ width, height }} />}
      </div>
    </Tooltip>
  )
}
