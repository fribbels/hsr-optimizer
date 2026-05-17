import { useSimUpgrades } from 'lib/characterPreview/useSimScoringHooks'
import { defaultGap } from 'lib/constants/constantsUi'
import { TeammateUpgrades } from 'lib/tabs/tabOptimizer/analysis/TeammateUpgrades'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ScoringConfigType } from 'types/metadata'

export const DpsScoreTeammateUpgradesTable = memo(function DpsScoreTeammateUpgradesTable({ configType }: { configType: ScoringConfigType }) {
  const { t } = useTranslation('charactersTab')
  const result = useSimUpgrades(configType)

  if (!result) return null

  return (
    <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 24, fontWeight: 500, color: 'var(--text-secondary)' }}>
        {t('CharacterPreview.SubstatUpgradeComparisons.TeammatesHeader')}
      </div>
      <TeammateUpgrades
        groupedUpgrades={result.teammateOrnamentUpgradeResults}
        baseSimScore={result.originalSimScore}
        variant='characters'
      />
    </div>
  )
})
