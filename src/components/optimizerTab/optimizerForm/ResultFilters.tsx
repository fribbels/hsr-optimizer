import { Flex } from 'antd'
import { HeaderText } from 'components/HeaderText'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import FilterRow from 'components/optimizerTab/optimizerForm/FilterRow'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import { useTranslation } from 'react-i18next'

export const MinMaxStatFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'MinMaxFilters' })
  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('StatHeader')/* Stat min / max filters */}</HeaderText>
        <TooltipImage type={Hint.statFilters()}/>
      </Flex>
      <Flex vertical gap={5}>
        <FilterRow name='Hp' label={t('HPLabel')}/>
        <FilterRow name='Atk' label={t('ATKLabel')}/>
        <FilterRow name='Def' label={t('DEFLabel')}/>
        <FilterRow name='Spd' label={t('SPDLabel')}/>
        <FilterRow name='Cr' label={t('CRLabel')}/>
        <FilterRow name='Cd' label={t('CDLabel')}/>
        <FilterRow name='Ehr' label={t('EHRLabel')}/>
        <FilterRow name='Res' label={t('RESLabel')}/>
        <FilterRow name='Be' label={t('BELabel')}/>
        <FilterRow name='Err' label={t('ERRLabel')}/>
      </Flex>
    </Flex>
  )
}


export const MinMaxRatingFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'MinMaxFilters' })
  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('StatHeader')/* Stat min / max filters */}</HeaderText>
        <TooltipImage type={Hint.ratingFilters()}/>
      </Flex>

      <FilterRow name='Ehp' label={t('EHPLabel')}/>
      <FilterRow name='Basic' label={t('BASICLabel')}/>
      <FilterRow name='Skill' label={t('SKILLLabel')}/>
      <FilterRow name='Ult' label={t('ULTLabel')}/>
      <FilterRow name='Fua' label={t('FUALabel')}/>
      <FilterRow name='Dot' label={t('DOTLabel')}/>
      <FilterRow name='Break' label={t('BREAKLabel')}/>
    </Flex>
  )
}