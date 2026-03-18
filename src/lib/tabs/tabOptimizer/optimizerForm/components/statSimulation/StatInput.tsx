import { Flex } from '@mantine/core'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { STAT_SIMULATION_INPUT_WIDTH, STAT_SIMULATION_STATS_WIDTH, useStatSimStat } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { InputNumberStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'

import type { StatSimType } from 'lib/stores/optimizerForm/optimizerFormTypes'

export function StatInput({ label, name, simType }: { label: string; name: string; simType: StatSimType }) {
  const value = useStatSimStat(simType, name)

  function handleChange(val: string | number) {
    const store = useOptimizerRequestStore.getState()
    const section = store.statSim?.[simType] as Record<string, unknown> | undefined
    const currentStats = (section?.stats ?? {}) as Record<string, number>
    store.updateStatSimField(simType, 'stats', { ...currentStats, [name]: val })
  }

  return (
    <Flex justify='space-between' align='center' w={STAT_SIMULATION_STATS_WIDTH}>
      <div>
        {label}
      </div>
      <InputNumberStyled
        hideControls
        value={value}
        onChange={handleChange}
        style={{ width: STAT_SIMULATION_INPUT_WIDTH }}
      />
    </Flex>
  )
}
