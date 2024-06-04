import { Flex, Typography } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import { FormStatRollSlider, FormStatRollSliderTopPercent } from 'components/optimizerTab/optimizerForm/FormStatRollSlider.jsx'
import { Constants } from 'lib/constants.ts'

const { Text } = Typography

export const SubstatWeightFilters = () => {
  return (
    <Flex vertical gap={4}>

      <Flex vertical gap={0}>
        <Flex justify="space-between" align="center">
          <HeaderText>Substat weight filter</HeaderText>
          <TooltipImage type={Hint.substatWeightFilter()} />
        </Flex>

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

      <Flex vertical gap={3}>
        <HeaderText>Min weighted rolls per relic</HeaderText>
        <Flex vertical gap={5}>
          <FormStatRollSliderTopPercent index={0} />
          <FormStatRollSliderTopPercent index={1} />
          <FormStatRollSliderTopPercent index={2} />
        </Flex>
      </Flex>
    </Flex>
  )
}
