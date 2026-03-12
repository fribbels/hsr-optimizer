import { Flex, TextInput } from '@mantine/core'
import { SubStats } from 'lib/constants/constants'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { MainStatsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/MainStatsSection'
import { OptimizerSetsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/SetsSection'
import {
  STAT_SIMULATION_OPTIONS_WIDTH,
  useStatSimField,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { SubstatsSection } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/SubstatsSection'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function SimulationInputs() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const statSimulationDisplay = useOptimizerDisplayStore((s) => s.statSimulationDisplay)

  // Hook into changes to the sim to calculate roll sum
  const statSimFormValues = useOptimizerRequestStore((s) => s.statSim)
  const substatRollsTotal = useMemo(() => {
    if (!statSimFormValues) return 0

    let sum = 0
    for (const stat of SubStats) {
      const rolls = statSimFormValues.substatRolls
      if (rolls?.stats[stat]) {
        sum += rolls.stats[stat]
      }
    }
    return sum
  }, [statSimFormValues])

  const simType = StatSimTypes.SubstatRolls
  const nameValue = useStatSimField<string>(simType, 'name')

  const renderedOptions = useMemo(() => {
    return (
      <>
        <Flex gap={5} style={{ display: statSimulationDisplay === StatSimTypes.SubstatRolls ? 'flex' : 'none' }}>
          <Flex direction="column" gap={5} w={STAT_SIMULATION_OPTIONS_WIDTH}>
            <HeaderText>{t('SetSelection.Header')}</HeaderText>
            <OptimizerSetsSection simType={simType} />
            <MainStatsSection simType={simType} />

            <HeaderText>{t('OptionsHeader')}</HeaderText>

            <TextInput
              placeholder={t('SimulationNamePlaceholder')}
              autoComplete='off'
              value={nameValue ?? ''}
              onChange={(e) => useOptimizerRequestStore.getState().updateStatSimField(simType, 'name', e.target.value)}
            />
          </Flex>

          <VerticalDivider />

          <SubstatsSection simType={simType} title={t('RollsHeader')} total={substatRollsTotal} />
        </Flex>

        <Flex gap={5} style={{ display: statSimulationDisplay === StatSimTypes.Disabled ? 'flex' : 'none' }}>
          <div style={{ width: STAT_SIMULATION_OPTIONS_WIDTH }} />
          <VerticalDivider />
        </Flex>
      </>
    )
  }, [statSimulationDisplay, substatRollsTotal, nameValue, simType, t])

  return (
    <Flex style={{ minHeight: 300 }}>
      {renderedOptions}
    </Flex>
  )
}
