import { SegmentedControl } from '@mantine/core'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { StatDisplay } from 'types/store'

export const StatsViewSelect = React.memo(function StatsViewSelect() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar' })
  const statDisplay = useOptimizerRequestStore((s) => s.statDisplay)
  const setStatDisplay = useOptimizerRequestStore((s) => s.setStatDisplay)

  return (
    <SegmentedControl
      onChange={(value) => setStatDisplay(value as StatDisplay)}
      value={statDisplay}
      fullWidth
      data={[
        { label: t('StatViewGroup.CombatStats') /* Combat stats */, value: 'combat' },
        { label: t('StatViewGroup.BasicStats') /* Basic stats */, value: 'base' },
      ]}
    />
  )
})
