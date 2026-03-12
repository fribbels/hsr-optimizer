import { Flex } from '@mantine/core'
import { Hint } from 'lib/interactions/hint'
import {
  FormStatRollSliders,
  FormStatRollSliderTopPercent,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatRollSlider'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'

export const SubstatWeightFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'WeightFilter' })
  return (
    <Flex direction="column" gap={20}>
      <Flex direction="column">
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('WeightFilterHeader') /* Substat weight filter */}</HeaderText>
          <TooltipImage type={Hint.substatWeightFilter()} />
        </Flex>

        <FormStatRollSliders />
      </Flex>

      <Flex direction="column" gap={3}>
        <HeaderText>{t('RollFilterHeader') /* Weighted rolls per relic */}</HeaderText>
        <Flex direction="column" gap={7}>
          {([0, 1, 2] as const).map((i) => (
            <FormStatRollSliderTopPercent key={i} index={i} />
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}
