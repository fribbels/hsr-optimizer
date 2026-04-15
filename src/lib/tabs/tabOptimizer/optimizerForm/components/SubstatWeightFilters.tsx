import { Flex } from '@mantine/core'
import { Hint } from 'lib/interactions/hint'
import { FormStatRollSliders } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatRollSlider'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'

export const SubstatWeightFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'WeightFilter' })
  return (
    <Flex direction='column' gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('WeightFilterHeader') /* Substat weight filter */}</HeaderText>
        <TooltipImage type={Hint.substatWeightFilter()} />
      </Flex>

      <FormStatRollSliders rollsHeader={t('RollFilterHeader')} />
    </Flex>
  )
}
