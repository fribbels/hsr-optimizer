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
import { modals } from '@mantine/modals'
import { TooltipImage } from 'lib/ui/TooltipImage'
import type { CSSProperties } from 'react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { useGlobalStore } from 'lib/stores/app/appStore'

const defaultGap = 5
const fullSizeOuterStyle: CSSProperties = { display: 'flex', flexDirection: 'column' }
const compactOuterStyle: CSSProperties = { display: 'flex', flexDirection: 'row-reverse' }
const controlsGapStyle: CSSProperties = { marginBottom: 2 }
const startButtonStyle: CSSProperties = { flex: 1, minWidth: 211 }
const buttonStyle: CSSProperties = { flex: 1 }
const statViewStyle: CSSProperties = { flex: 1, minWidth: 211 }

export const OptimizerControlsSection = memo(function OptimizerControlsSection({ isFullSize }: { isFullSize: boolean }) {
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
    setOptimizationInProgress(false)
    Optimizer.cancel()
  }, [setOptimizationInProgress])

  const startClicked = useCallback(() => {
    if (
      permutations < 1000000000
      || computeEngine === COMPUTE_ENGINE_GPU_EXPERIMENTAL
      || computeEngine === COMPUTE_ENGINE_GPU_STABLE
    ) {
      startOptimization()
    } else {
      setManyPermsModalOpen(true)
    }
  }, [permutations, computeEngine])

  const resetClicked = useCallback(() => {
    resetFilters()
  }, [])

  return (
    <Flex
      direction={isFullSize ? 'column' : 'row'}
      gap={isFullSize ? 5 : 20}
      style={isFullSize ? fullSizeOuterStyle : compactOuterStyle}
    >
      <ManyPermsModal startSearch={startOptimization} manyPermsModalOpen={manyPermsModalOpen} setManyPermsModalOpen={setManyPermsModalOpen} />
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

          {isFullSize && <ComputeEngineSelect />}

          <Flex gap={defaultGap} justify='space-around'>
            <Button variant="default" onClick={cancelClicked} style={buttonStyle}>
              {tCommon('Cancel') /* Cancel */}
            </Button>

            <Button
              variant="default"
              style={buttonStyle}
              onClick={() => modals.openConfirmModal({
                title: t('ControlsGroup.ResetConfirm.Title'),
                children: t('ControlsGroup.ResetConfirm.Description'),
                labels: { confirm: tCommon('Yes'), cancel: tCommon('No') },
                centered: true,
                onConfirm: resetClicked,
              })}
            >
              {tCommon('Reset') /* Reset */}
            </Button>
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="column" gap={5} style={statViewStyle}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('StatViewGroup.Header') /* Stat and filter view */}</HeaderText>
          <TooltipImage type={Hint.statDisplay()} />
        </Flex>

        <StatsViewSelect />

        <MemoViewSelect isFullSize={isFullSize} />
      </Flex>

      {!isFullSize
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
