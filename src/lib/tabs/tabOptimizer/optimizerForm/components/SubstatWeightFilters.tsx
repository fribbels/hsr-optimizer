import { Flex } from '@mantine/core'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { Hint } from 'lib/interactions/hint'
import {
  FormStatRollSliders,
  FormStatRollSliderMinWeightedRolls,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatRollSlider'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'

export const SubstatWeightFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'WeightFilter' })
  return (
    <Flex direction="column" gap={20}>
      <Flex direction="column" gap={optimizerTabDefaultGap}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('WeightFilterHeader') /* Substat weight filter */}</HeaderText>
          <TooltipImage type={Hint.substatWeightFilter()} />
        </Flex>

        <FormStatRollSliders />
      </Flex>

      <Flex direction="column" gap={optimizerTabDefaultGap}>
        <HeaderText>{t('RollFilterHeader') /* Weighted rolls per relic */}</HeaderText>
        <FormStatRollSliderMinWeightedRolls />
      </Flex>
    </Flex>
  )
}
