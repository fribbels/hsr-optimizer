import {
  Button,
  Flex,
  SegmentedControl,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconArrowsExchange,
  IconChevronDown,
  IconChevronsLeft,
  IconChevronUp,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import {
  deleteAllStatSimulationBuilds,
  importOptimizerBuild,
  overwriteStatSimulationBuild,
  saveStatSimulationBuildFromForm,
  startOptimizerStatSimulation,
} from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { SimulatedBuildsGrid } from 'lib/tabs/tabOptimizer/optimizerForm/components/SimulatedBuildsGrid'
import { SimulationInputs } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/SimulationInputs'
import {
  STAT_SIMULATION_GRID_WIDTH,
  STAT_SIMULATION_ROW_HEIGHT,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { FormCard } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const StatSimulationDisplay = memo(function StatSimulationDisplay() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const { t: tCommon } = useTranslation('common')
  const statSimulationDisplay = useOptimizerDisplayStore((s) => s.statSimulationDisplay)
  const setStatSimulationDisplay = useOptimizerDisplayStore((s) => s.setStatSimulationDisplay)

  function isHidden() {
    return statSimulationDisplay === StatSimTypes.Disabled || !statSimulationDisplay
  }

  return (
    <FormCard style={{ overflow: 'hidden' }} size='large' height={STAT_SIMULATION_ROW_HEIGHT}>
      <Flex gap={15} style={{ height: '100%' }}>
        <Flex direction='column' gap={15} align='center'>
          <SegmentedControl
            onChange={(value) => setStatSimulationDisplay(value as StatSimTypes)}
            value={statSimulationDisplay}
            fullWidth
            style={{ width: `${STAT_SIMULATION_GRID_WIDTH}px` }}
            data={[
              { label: t('ModeSelector.Off'), value: StatSimTypes.Disabled },
              { label: t('ModeSelector.RollCount'), value: StatSimTypes.SubstatRolls },
            ]}
          />

          <div style={{ minHeight: 302 }}>
            <SimulatedBuildsGrid />
          </div>

          <Flex gap={10}>
            <Button
              variant='default'
              style={{ width: 200 }}
              disabled={isHidden()}
              onClick={startOptimizerStatSimulation}
              leftSection={<IconChevronDown size={16} />}
            >
              {t('FooterLabels.Simulate')}
            </Button>
            <Button variant='default' style={{ width: 200 }} disabled={isHidden()} onClick={importOptimizerBuild} leftSection={<IconChevronUp size={16} />}>
              {t('FooterLabels.Import')}
            </Button>
            <Button
              variant='default'
              style={{ width: 200 }}
              disabled={isHidden()}
              onClick={() => setOpen(OpenCloseIDs.OPTIMIZER_SETS_DRAWER)}
              leftSection={<IconSettings size={16} />}
            >
              {t('FooterLabels.Conditionals')}
            </Button>
          </Flex>
        </Flex>

        <Flex direction='column' justify='space-around'>
          <Flex direction='column' gap={10}>
            <Button
              style={{ width: 35, height: 100, padding: 0 }}
              onClick={() => saveStatSimulationBuildFromForm()}
              disabled={isHidden()}
            >
              <IconChevronsLeft />
            </Button>
            <Button
              variant='default'
              style={{ width: 35, height: 35, padding: 0 }}
              disabled={isHidden()}
              onClick={overwriteStatSimulationBuild}
            >
              <IconArrowsExchange />
            </Button>
            <Button
              variant='default'
              style={{ width: 35, height: 35, padding: 0 }}
              disabled={isHidden()}
              onClick={() =>
                modals.openConfirmModal({
                  title: t('DeletePopup.Title'),
                  children: t('DeletePopup.Description'),
                  labels: { confirm: tCommon('Yes'), cancel: tCommon('Cancel') },
                  centered: true,
                  onConfirm: deleteAllStatSimulationBuilds,
                })}
            >
              <IconTrash />
            </Button>
          </Flex>
        </Flex>

        <SimulationInputs />
      </Flex>
    </FormCard>
  )
})
