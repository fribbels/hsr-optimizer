import { Flex, Typography } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import {
  FormStatRollSlider,
  FormStatRollSliderTopPercent,
} from 'components/optimizerTab/optimizerForm/FormStatRollSlider.jsx'
import { Constants } from 'lib/constants.ts'
import { HorizontalDivider } from 'components/Dividers.tsx'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants.ts'

const { Text } = Typography

export const SubstatWeightFilters = () => {
  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify="space-between" align="center">
        <HeaderText>Substat weight filter</HeaderText>
        <TooltipImage type={Hint.substatWeightFilter()} />
      </Flex>

      <Flex vertical gap={1}>
        <FormStatRollSlider text="HP" name={Constants.Stats.HP_P} />
        <FormStatRollSlider text="ATK" name={Constants.Stats.ATK_P} />
        <FormStatRollSlider text="DEF" name={Constants.Stats.DEF_P} />
        <FormStatRollSlider text="SPD" name={Constants.Stats.SPD} />
        <FormStatRollSlider text="CR" name={Constants.Stats.CR} />
        <FormStatRollSlider text="CD" name={Constants.Stats.CD} />
        <FormStatRollSlider text="EHR" name={Constants.Stats.EHR} />
        <FormStatRollSlider text="RES" name={Constants.Stats.RES} />
        <FormStatRollSlider text="BE" name={Constants.Stats.BE} />
      </Flex>

      <HorizontalDivider />

      <Text>Top % of weighted relics</Text>
      <FormStatRollSliderTopPercent />
    </Flex>
  )
}
