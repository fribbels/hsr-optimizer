import { Flex } from 'antd'
import { Hint } from 'lib/interactions/hint'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import FilterRow from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterRow'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'

const statFilterData = [
  { name: 'Hp', labelKey: 'HPLabel' },
  { name: 'Atk', labelKey: 'ATKLabel' },
  { name: 'Def', labelKey: 'DEFLabel' },
  { name: 'Spd', labelKey: 'SPDLabel' },
  { name: 'Cr', labelKey: 'CRLabel' },
  { name: 'Cd', labelKey: 'CDLabel' },
  { name: 'Ehr', labelKey: 'EHRLabel' },
  { name: 'Res', labelKey: 'RESLabel' },
  { name: 'Be', labelKey: 'BELabel' },
  { name: 'Err', labelKey: 'ERRLabel' },
] as const
type StatFilterKey = typeof statFilterData[number]['labelKey']
type StatFilterName = typeof statFilterData[number]['name']

const ratingFilterData = [
  { name: 'Ehp', labelKey: 'EHPLabel' },
  { name: 'Basic', labelKey: 'BASICLabel' },
  { name: 'Skill', labelKey: 'SKILLLabel' },
  { name: 'Ult', labelKey: 'ULTLabel' },
  { name: 'Fua', labelKey: 'FUALabel' },
  { name: 'Dot', labelKey: 'DOTLabel' },
  { name: 'Break', labelKey: 'BREAKLabel' },
  { name: 'Heal', labelKey: 'HEALLabel' },
  { name: 'Shield', labelKey: 'SHIELDLabel' },
] as const
type RatingFilterKey = typeof ratingFilterData[number]['labelKey']
type RatingFilterName = typeof ratingFilterData[number]['name']
type FilterKeys = StatFilterKey | RatingFilterKey
type FilterNames = RatingFilterName | StatFilterName

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
      <FilterRow name='Heal' label={t('HEALLabel')}/>
      <FilterRow name='Shield' label={t('SHIELDLabel')}/>
    </Flex>
  )
}
