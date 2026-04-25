import { Flex } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { deleteStatSimulationBuild } from 'lib/simulations/statSimulationController'
import { StatSimulationName } from 'lib/simulations/StatSimulationName'
import type { Simulation, SimulationRequest } from 'lib/simulations/statSimulationTypes'
import { gridStore } from 'lib/stores/gridStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { STAT_SIMULATION_GRID_WIDTH } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { clone } from 'lib/utils/objectUtils'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function zeroesToNull<T extends Record<string, number | null | undefined>>(obj: T): T {
  for (const [key, value] of Object.entries(obj)) {
    if (value === 0) {
      const record = obj as Record<string, number | null>
      record[key] = null
    }
  }
  return obj
}

type StoredSimulation = Simulation & { key: string }

export function SimulatedBuildsGrid() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const statSimulations = useOptimizerDisplayStore((s) => s.statSimulations) as StoredSimulation[]
  const selectedStatSimulations = useOptimizerDisplayStore((s) => s.selectedStatSimulations)

  function onRowClick(key: string) {
    useOptimizerDisplayStore.getState().setSelectedStatSimulations([key])
  }

  // Sync form + grid whenever the selected sim changes (from row click or external trigger like optimizer grid click)
  const selectedKey = selectedStatSimulations[0]
  useEffect(() => {
    if (!selectedKey) return

    const sims = useOptimizerDisplayStore.getState().statSimulations as StoredSimulation[]
    const sim = sims.find((s) => s.key === selectedKey)
    if (!sim) return

    const cloneRequest = clone(sim.request)
    zeroesToNull(cloneRequest.stats)
    const currentStatSim = useOptimizerRequestStore.getState().statSim ?? { key: '', benchmarks: {} as SimulationRequest, substatRolls: {} as SimulationRequest }
    useOptimizerRequestStore.getState().setStatSim({
      ...currentStatSim,
      [sim.simType]: cloneRequest,
    })
    useOptimizerDisplayStore.getState().setStatSimulationDisplay(sim.simType)

    gridStore.optimizerGridApi()?.forEachNode((node) => {
      if (node.data?.statSim?.key === selectedKey) {
        node.setSelected(true, true)
      }
    })
  }, [selectedKey])

  return (
    <div
      style={{
        flex: 1,
        width: STAT_SIMULATION_GRID_WIDTH,
        height: '100%',
        backgroundColor: '#0000001a',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        overflowY: 'auto',
        maxHeight: 300,
      }}
    >
      {statSimulations.length === 0
        ? (
          <Flex justify='center' align='center' style={{ padding: 16, opacity: 0.5 }}>
            {t('NoStatSimulations') /* 'No custom stat simulations selected' */}
          </Flex>
        )
        : (
          <Flex direction='column'>
            {statSimulations.map((record) => (
              <Flex
                key={record.key}
                onClick={() => onRowClick(record.key)}
                align='center'
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedStatSimulations[0] === record.key ? 'var(--primary-light-alpha)' : undefined,
                  padding: '6px 8px',
                }}
              >
                <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <StatSimulationName sim={record} />
                </div>
                <a
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteStatSimulationBuild(record)
                  }}
                  style={{ display: 'flex', flexShrink: 0, paddingLeft: 8, cursor: 'pointer' }}
                >
                  <IconX size={18} />
                </a>
              </Flex>
            ))}
          </Flex>
        )}
    </div>
  )
}
