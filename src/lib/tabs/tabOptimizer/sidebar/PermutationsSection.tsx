import { Flex } from '@mantine/core'
import { Hint } from 'lib/interactions/hint'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { PermutationDisplay } from 'lib/tabs/tabOptimizer/sidebar/PermutationDisplay'
import { ProgressDisplay } from 'lib/tabs/tabOptimizer/sidebar/ProgressDisplay'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

export const PermutationsSection = React.memo(function PermutationsSection({ isFullSize }: { isFullSize: boolean }) {
  const { permutationDetails, permutations, permutationsSearched, permutationsResults } = useOptimizerDisplayStore(
    useShallow((s) => ({
      permutationDetails: s.permutationDetails,
      permutations: s.permutations,
      permutationsSearched: s.permutationsSearched,
      permutationsResults: s.permutationsResults,
    })),
  )
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar' })
  const { t: tCommon } = useTranslation('common', { keyPrefix: 'ReadableParts' })
  return (
    <Flex direction="column" gap={isFullSize ? 10 : 5} miw={211}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('Permutations') /* Permutations */}</HeaderText>
        <TooltipImage type={Hint.optimizationDetails()} />
      </Flex>

      {isFullSize && (
        <Flex direction="column">
          <PermutationDisplay left={tCommon('Head')} right={permutationDetails.Head} total={permutationDetails.HeadTotal} />
          <PermutationDisplay left={tCommon('Hands')} right={permutationDetails.Hands} total={permutationDetails.HandsTotal} />
          <PermutationDisplay left={tCommon('Body')} right={permutationDetails.Body} total={permutationDetails.BodyTotal} />
          <PermutationDisplay left={tCommon('Feet')} right={permutationDetails.Feet} total={permutationDetails.FeetTotal} />
          <PermutationDisplay left={tCommon('PlanarSphere')} right={permutationDetails.PlanarSphere} total={permutationDetails.PlanarSphereTotal} />
          <PermutationDisplay left={tCommon('LinkRope')} right={permutationDetails.LinkRope} total={permutationDetails.LinkRopeTotal} />
        </Flex>
      )}

      <Flex direction="column">
        <PermutationDisplay left={t('Perms') /* Perms */} right={permutations} />
        <PermutationDisplay left={t('Searched') /* Searched */} right={permutationsSearched} />
        <PermutationDisplay left={t('Results') /* Results */} right={permutationsResults} />
      </Flex>

      {isFullSize && <ProgressDisplay />}
    </Flex>
  )
})
