import { IconBoltFilled } from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import {
  COMPUTE_ENGINE_GPU_EXPERIMENTAL,
  COMPUTE_ENGINE_GPU_STABLE,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { Hint } from 'lib/interactions/hint'
import { Optimizer } from 'lib/optimization/optimizer'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import {
  resetFilters,
  startOptimization,
} from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { ComputeEngineSelect } from 'lib/tabs/tabOptimizer/sidebar/ComputeEngineSelect'
import { ManyPermsModal } from 'lib/tabs/tabOptimizer/sidebar/ManyPermsModal'
import { MemoViewSelect } from 'lib/tabs/tabOptimizer/sidebar/MemoViewSelect'
import { ProgressDisplay } from 'lib/tabs/tabOptimizer/sidebar/ProgressDisplay'
import { StatsViewSelect } from 'lib/tabs/tabOptimizer/sidebar/StatsViewSelect'
import { HeaderText } from 'lib/ui/HeaderText'
import { PopConfirm } from 'lib/ui/PopConfirm'
import { TooltipImage } from 'lib/ui/TooltipImage'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { useGlobalStore } from 'lib/state/db'

const defaultGap = 5
const fullSizeOuterStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const compactOuterStyle: React.CSSProperties = { display: 'flex', flexDirection: 'row-reverse' }
const controlsGapStyle: React.CSSProperties = { marginBottom: 2 }
const startButtonStyle: React.CSSProperties = { flex: 1, minWidth: 211 }
const flexOneStyle: React.CSSProperties = { flex: 1 }
const statViewStyle: React.CSSProperties = { flex: 1, minWidth: 211 }

export const OptimizerControlsSection = React.memo(function OptimizerControlsSection(props: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar' })
  const { t: tCommon } = useTranslation('common')

  const { permutations, optimizationInProgress } = useOptimizerDisplayStore(
    useShallow((s) => ({
      permutations: s.permutations,
      optimizationInProgress: s.optimizationInProgress,
    })),
  )
  const setOptimizationInProgress = useOptimizerDisplayStore((s) => s.setOptimizationInProgress)
  const computeEngine = useGlobalStore((s) => s.savedSession[SavedSessionKeys.computeEngine])

  const [manyPermsModalOpen, setManyPermsModalOpen] = useState(false)

  const cancelClicked = useCallback(() => {
    console.log('Cancel clicked')
    setOptimizationInProgress(false)
    Optimizer.cancel()
  }, [setOptimizationInProgress])

  const startOptimizerFn = useCallback(() => {
    startOptimization()
  }, [])

  const startClicked = useCallback(() => {
    if (
      permutations < 1000000000
      || computeEngine == COMPUTE_ENGINE_GPU_EXPERIMENTAL
      || computeEngine == COMPUTE_ENGINE_GPU_STABLE
    ) {
      startOptimizerFn()
    } else {
      setManyPermsModalOpen(true)
    }
  }, [permutations, computeEngine, startOptimizerFn])

  const resetClicked = useCallback(() => {
    console.log('Reset clicked')
    resetFilters()
  }, [])

  return (
    <Flex
      direction={props.isFullSize ? 'column' : 'row'}
      gap={props.isFullSize ? 5 : 20}
      style={props.isFullSize ? fullSizeOuterStyle : compactOuterStyle}
    >
      <ManyPermsModal startSearch={startOptimizerFn} manyPermsModalOpen={manyPermsModalOpen} setManyPermsModalOpen={setManyPermsModalOpen} />
      <Flex direction="column" gap={5}>
        <HeaderText>{t('ControlsGroup.Header') /* Controls */}</HeaderText>
        <Flex gap={defaultGap} style={controlsGapStyle} direction="column">
          <Flex gap={defaultGap}>
            <Button
              leftSection={<IconBoltFilled size={16} />}
              loading={optimizationInProgress}
              onClick={startClicked}
              style={startButtonStyle}
            >
              {t('ControlsGroup.Start') /* Start optimizer */}
            </Button>
          </Flex>

          {props.isFullSize && <ComputeEngineSelect />}

          <Flex gap={defaultGap}>
            <Button variant="default" onClick={cancelClicked} style={flexOneStyle}>
              {tCommon('Cancel') /* Cancel */}
            </Button>

            <PopConfirm
              title={t('ControlsGroup.ResetConfirm.Title')} // 'Reset all filters?'
              description={t('ControlsGroup.ResetConfirm.Description')} // 'All filters will be reset to their default values'
              onConfirm={resetClicked}
              okText={tCommon('Yes')} // 'Yes'
              cancelText={tCommon('No')} // 'No'
              placement='bottomRight'
            >
              <Button variant="default" style={flexOneStyle}>
                {tCommon('Reset') /* Reset */}
              </Button>
            </PopConfirm>
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="column" gap={5} style={statViewStyle}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('StatViewGroup.Header') /* Stat and filter view */}</HeaderText>
          <TooltipImage type={Hint.statDisplay()} />
        </Flex>

        <StatsViewSelect />

        <MemoViewSelect isFullSize={props.isFullSize} />
      </Flex>

      {!props.isFullSize
        && (
          <Flex direction="column" gap={3} style={statViewStyle}>
            <HeaderText>{t('ComputeEngine') /* Compute engine */}</HeaderText>
            <ComputeEngineSelect />
            <ProgressDisplay />
          </Flex>
        )}
    </Flex>
  )
})
