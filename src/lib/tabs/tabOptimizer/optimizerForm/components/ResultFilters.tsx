import { Flex } from '@mantine/core'
import { Hint } from 'lib/interactions/hint'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { FilterRow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterRow'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'

export function MinMaxStatFilters() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'MinMaxFilters' })
  return (
    <Flex direction='column' gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('StatHeader') /* Stat min / max filters */}</HeaderText>
        <TooltipImage type={Hint.statFilters()} />
      </Flex>
      <Flex direction='column' gap={7}>
        <FilterRow name='Atk' label={t('ATKLabel')} type='stat' />
        <FilterRow name='Hp' label={t('HPLabel')} type='stat' />
        <FilterRow name='Def' label={t('DEFLabel')} type='stat' />
        <FilterRow name='Spd' label={t('SPDLabel')} type='stat' />
        <FilterRow name='Cr' label={t('CRLabel')} type='stat' />
        <FilterRow name='Cd' label={t('CDLabel')} type='stat' />
        <FilterRow name='Ehr' label={t('EHRLabel')} type='stat' />
        <FilterRow name='Res' label={t('RESLabel')} type='stat' />
        <FilterRow name='Be' label={t('BELabel')} type='stat' />
        <FilterRow name='Err' label={t('ERRLabel')} type='stat' />
      </Flex>
    </Flex>
  )
}

export function MinMaxRatingFilters() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'MinMaxFilters' })
  return (
    <Flex direction='column' gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('RatingHeader') /* Rating min / max filters */}</HeaderText>
        <TooltipImage type={Hint.ratingFilters()} />
      </Flex>

      <Flex direction='column' gap={7}>
        <FilterRow name='Ehp' label={t('EHPLabel')} type='rating' />
        <FilterRow name='Basic' label={t('BASICLabel')} type='rating' />
        <FilterRow name='Skill' label={t('SKILLLabel')} type='rating' />
        <FilterRow name='Ult' label={t('ULTLabel')} type='rating' />
        <FilterRow name='Fua' label={t('FUALabel')} type='rating' />
        <FilterRow name='MemoSkill' label={t('MEMOSKILLLabel')} type='rating' />
        <FilterRow name='Dot' label={t('DOTLabel')} type='rating' />
        <FilterRow name='Break' label={t('BREAKLabel')} type='rating' />
      </Flex>
    </Flex>
  )
}
