import { CaretDownOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'
import { Hint } from 'lib/interactions/hint'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import FilterRow from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterRow'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const MinMaxFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'MinMaxFilters' })
  const [statView, setStatView] = useState(true)
  return (
    <div>
      <Flex vertical gap={optimizerTabDefaultGap} style={{ display: statView ? 'flex' : 'none' }}>
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
      <Flex vertical gap={optimizerTabDefaultGap} style={{ display: statView ? 'none' : 'flex' }}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('RatingHeader')/* Rating min / max filters */}</HeaderText>
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
      <Flex
        style={{ height: 20, width: '100%', marginTop: 4, cursor: 'pointer' }}
        justify='space-around'
        align='flex-start'
        onClick={() => setStatView(!statView)}
      >
        <CaretDownOutlined/>
      </Flex>
    </div>
  )
}
