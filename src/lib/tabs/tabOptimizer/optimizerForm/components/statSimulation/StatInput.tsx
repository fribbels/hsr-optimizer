import { Flex, NumberInput, Text } from '@mantine/core'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { STAT_SIMULATION_STATS_WIDTH, useStatSimStat } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'

export function StatInput(props: { label: string; name: string; simType: string }) {
  const value = useStatSimStat(props.simType, props.name)

  return (
    <Flex justify='space-between' style={{ width: STAT_SIMULATION_STATS_WIDTH }}>
      <Text>
        {props.label}
      </Text>
      <NumberInput
        size='sm'
        hideControls
        value={value}
        onChange={(val) => {
          const store = useOptimizerRequestStore.getState()
          const sim = store.statSim as Record<string, Record<string, unknown>> | undefined
          const currentStats = (sim?.[props.simType]?.stats ?? {}) as Record<string, number>
          store.updateStatSimField(props.simType, 'stats', {
            ...currentStats,
            [props.name]: val,
          })
        }}
        style={{ width: 70 }}
      />
    </Flex>
  )
}
