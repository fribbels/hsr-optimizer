import { IconX } from '@tabler/icons-react'
import { IRowNode } from 'ag-grid-community'
import { Flex, Table } from '@mantine/core'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import {
  deleteStatSimulationBuild,
  renderDefaultSimulationName,
} from 'lib/simulations/statSimulationController'
import {
  Simulation,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import { STAT_SIMULATION_GRID_WIDTH } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// FIXME MED

interface DataType {
  key: string
  name: string
  simType: string
  request: object
  hash: string
}

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
  const statSimulations = useOptimizerUIStore((s) => s.statSimulations)
  const selectedStatSimulations = useOptimizerUIStore((s) => s.selectedStatSimulations)
  const setSelectedStatSimulations = useOptimizerUIStore((s) => s.setSelectedStatSimulations)

  // Links the table -> form & grid
  function updateSimulationForm(key: string) {
    // Check to avoid update loop
    if (selectedStatSimulations[0] != key) {
      setSelectedStatSimulations(key != null ? [key] : [])
    }

    const statSim = statSimulations.find((s) => s.key === key)
    console.log('Syncing matching statSim', statSim)

    if (!statSim) return

    // Match the selected sim on the optimizer grid and select it
    let matchingNode: IRowNode | undefined
    window.optimizerGrid?.current?.api?.forEachNode((node) => {
      if (node.data?.statSim?.key == statSim.key) {
        matchingNode = node
      }
    })
    if (matchingNode) {
      matchingNode.setSelected(true, true)
    }

    // Update the form with selected sim
    const cloneRequest = TsUtils.clone(statSim.request)
    zeroesToNull(cloneRequest.stats)
    const currentStatSim = useOptimizerFormStore.getState().statSim
    if (currentStatSim) {
      useOptimizerFormStore.getState().setStatSim({
        ...currentStatSim,
        [statSim.simType]: cloneRequest,
      })
    }
    useOptimizerUIStore.getState().setStatSimulationDisplay(statSim.simType)
  }

  useEffect(() => {
    if (selectedStatSimulations.length) {
      updateSimulationForm(selectedStatSimulations[0]!)
    }
  }, [selectedStatSimulations])

  const data = statSimulations as DataType[]

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
      {data.length === 0
        ? (
          <Flex justify='center' align='center' style={{ padding: 16, opacity: 0.5 }}>
            {t('NoStatSimulations') /* 'No custom stat simulations selected' */}
          </Flex>
        )
        : (
          <Table>
            <Table.Tbody>
              {data.map((record) => (
                <Table.Tr
                  key={record.key}
                  onClick={() => {
                    setSelectedStatSimulations(record.key != null ? [record.key] : [])
                  }}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedStatSimulations[0] === record.key ? 'rgba(22, 104, 220, 0.3)' : undefined,
                  }}
                >
                  <Table.Td style={{ width: 560, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {renderDefaultSimulationName(record as Simulation)}
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
