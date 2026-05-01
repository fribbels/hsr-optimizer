import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import {
  groupTeammateSetUpgrades,
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
    simScore: precisionRound(upgrade.simulationResult.simScore, 2),
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
