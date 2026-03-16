import { IconX } from '@tabler/icons-react'
import { Flex, Table } from '@mantine/core'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { deleteStatSimulationBuild } from 'lib/simulations/statSimulationController'
import { StatSimulationName } from 'lib/simulations/StatSimulationName'
import { Simulation } from 'lib/simulations/statSimulationTypes'
import { STAT_SIMULATION_GRID_WIDTH } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { gridStore } from 'lib/utils/gridStore'
import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'

function zeroesToNull<T extends Record<string, number | null | undefined>>(obj: T): T {
  for (const [key, value] of Object.entries(obj)) {
    if (value === 0) {
      ;(obj as Record<string, number | null>)[key] = null
    }
  }
  return obj
}

export function SimulatedBuildsGrid() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const statSimulations = useOptimizerDisplayStore((s) => s.statSimulations)
  const selectedStatSimulations = useOptimizerDisplayStore((s) => s.selectedStatSimulations)

  function onRowClick(key: string) {
    useOptimizerDisplayStore.getState().setSelectedStatSimulations([key])

    const sim = statSimulations.find((s) => s.key === key)
    if (!sim) return

    // Sync form with selected sim
    const cloneRequest = TsUtils.clone(sim.request)
    zeroesToNull(cloneRequest.stats)
    const currentStatSim = useOptimizerRequestStore.getState().statSim
    if (currentStatSim) {
      useOptimizerRequestStore.getState().setStatSim({
        ...currentStatSim,
        [sim.simType]: cloneRequest,
      })
    }
    useOptimizerDisplayStore.getState().setStatSimulationDisplay(sim.simType)

    // Select matching optimizer grid node
    gridStore.optimizerGridApi()?.forEachNode((node) => {
      if (node.data?.statSim?.key === key) {
        node.setSelected(true, true)
      }
    })
  }

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
          <Table>
            <Table.Tbody>
              {statSimulations.map((record) => (
                <Table.Tr
                  key={record.key}
                  onClick={() => onRowClick(record.key)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedStatSimulations[0] === record.key ? 'var(--mantine-color-primary-light)' : undefined,
                  }}
                >
                  <Table.Td style={{ width: 560, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <StatSimulationName sim={record as Simulation} />
                  </Table.Td>
                  <Table.Td style={{ width: 36 }}>
                    <a
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteStatSimulationBuild(record)
                      }}
                      style={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <IconX />
                    </a>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
    </div>
  )
}
