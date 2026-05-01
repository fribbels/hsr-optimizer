import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { defaultGap } from 'lib/constants/constantsUi'
import { TeammateUpgrades } from 'lib/tabs/tabOptimizer/analysis/TeammateUpgrades'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const DpsScoreTeammateUpgradesTable = memo(function DpsScoreTeammateUpgradesTable() {
  const { t } = useTranslation('charactersTab')
  const result = useSimScoringContext(ScoringSelector.Upgrades)

  if (!result) return null

  return (
    <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 24, fontWeight: 500, color: 'var(--text-secondary)' }}>
        {t('CharacterPreview.SubstatUpgradeComparisons.TeammatesHeader')}
      </div>
      <TeammateUpgrades
        groupedUpgrades={result.teammateOrnamentUpgradeResults}
        baseSimScore={result.originalSimScore}
        variant="characters"
      />
    </div>
  )
})
