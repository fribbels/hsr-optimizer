import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import {
  groupTeammateSetUpgrades,
  TEAMMATE_UPGRADE_PRECISION,
  type PreTeammateSetUpgrade,
} from 'lib/simulations/teammateUpgradeGrouping'
import { precisionRound } from 'lib/utils/mathUtils'
import { TeammateUpgrades } from 'lib/tabs/tabOptimizer/analysis/TeammateUpgrades'
import { memo } from 'react'

export const DpsScoreTeammateUpgradesTable = memo(function DpsScoreTeammateUpgradesTable() {
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
    <TeammateUpgrades
      groupedUpgrades={groupedUpgrades}
      baseSimScore={result.originalSimScore}
      variant="characters"
    />
  )
})
