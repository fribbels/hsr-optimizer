import { Flex } from 'antd'
import { HeaderText } from 'components/HeaderText'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import { FormStatRollSlider, FormStatRollSliderTopPercent } from 'components/optimizerTab/optimizerForm/FormStatRollSlider.jsx'
import { Constants } from 'lib/constants'
import { useTranslation } from 'react-i18next'

export const SubstatWeightFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'WeightFilter' })
  return (
    <Flex vertical gap={4}>

      <Flex vertical gap={0}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('WeightFilterHeader')/* Substat weight filter */}</HeaderText>
          <TooltipImage type={Hint.substatWeightFilter()}/>
        </Flex>

        <FormStatRollSlider text={t('HPFilterText')} name={Constants.Stats.HP_P}/>
        <FormStatRollSlider text={t('ATKFilterText')} name={Constants.Stats.ATK_P}/>
        <FormStatRollSlider text={t('DEFFilterText')} name={Constants.Stats.DEF_P}/>
        <FormStatRollSlider text={t('SPDFilterText')} name={Constants.Stats.SPD}/>
        <FormStatRollSlider text={t('CRFilterText')} name={Constants.Stats.CR}/>
        <FormStatRollSlider text={t('CDFilterText')} name={Constants.Stats.CD}/>
        <FormStatRollSlider text={t('EHRFilterText')} name={Constants.Stats.EHR}/>
        <FormStatRollSlider text={t('RESFilterText')} name={Constants.Stats.RES}/>
        <FormStatRollSlider text={t('BEFilterText')} name={Constants.Stats.BE}/>
      </Flex>

      <Flex vertical gap={3}>
        <HeaderText>{t('RollFilterHeader')/* Weighted rolls per relic */}</HeaderText>
        <Flex vertical gap={5}>
          <FormStatRollSliderTopPercent index={0}/>
          <FormStatRollSliderTopPercent index={1}/>
          <FormStatRollSliderTopPercent index={2}/>
        </Flex>
      </Flex>
    </Flex>
  )
}
