import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  groupTeammateSetUpgrades,
  TEAMMATE_UPGRADE_PRECISION,
  type PreTeammateSetUpgrade,
} from 'lib/simulations/teammateUpgradeGrouping'
import { TeammateUpgrades } from 'lib/tabs/tabOptimizer/analysis/TeammateUpgrades'
import { precisionRound } from 'lib/utils/mathUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const DpsScoreTeammateUpgradesTable = memo(function DpsScoreTeammateUpgradesTable() {
  const { t } = useTranslation('charactersTab')
  const result = useSimScoringContext(ScoringSelector.Upgrades)

  if (!result) return null

  const form = result.simulationForm

  const inputs: PreTeammateSetUpgrade[] = result.teammateOrnamentUpgradeResults.map((upgrade) => ({
    id: form[upgrade.teammate!].characterId,
    set: upgrade.set!,
    oldSet: form[upgrade.teammate!].teamOrnamentSet,
    simScore: precisionRound(upgrade.simulationResult.simScore, TEAMMATE_UPGRADE_PRECISION),
  }))

  const groupedUpgrades = groupTeammateSetUpgrades(inputs)

  return (
    <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 24, fontWeight: 500, color: 'var(--text-secondary)' }}>
        {t('CharacterPreview.SubstatUpgradeComparisons.TeammatesHeader')}
      </div>
      <TeammateUpgrades
        groupedUpgrades={groupedUpgrades}
        baseSimScore={result.originalSimScore}
        variant="characters"
      />
    </div>
  )
})
