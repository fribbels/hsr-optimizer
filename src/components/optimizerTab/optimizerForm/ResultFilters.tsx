import { Flex } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import FilterRow from 'components/optimizerTab/optimizerForm/FilterRow'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import { useTranslation } from 'react-i18next'
import { CaretDownOutlined } from '@ant-design/icons'
import { useState } from 'react'

export const MinMaxStatFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'MinMaxFilters' })
  const [view, setView] = useState('Stats')

  return (
    <div>
      <Flex vertical gap={optimizerTabDefaultGap} style={{ display: view == 'Stats' ? 'flex' : 'none' }}>
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
        <Flex
          style={{ height: 20, width: '100%', marginTop: -4, cursor: 'pointer' }}
          justify='space-around'
          align='flex-start'
          onClick={() => setView('Ratings')}
        >
          <CaretDownOutlined/>
        </Flex>
      </Flex>

      <Flex vertical gap={optimizerTabDefaultGap} style={{ display: view == 'Ratings' ? 'flex' : 'none' }}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('RatingHeader')/* Rating min / max filters */}</HeaderText>
          <TooltipImage type={Hint.ratingFilters()}/>
        </Flex>

        <FilterRow name='Weight' label={t('WEIGHTLabel')}/>
        <FilterRow name='Ehp' label={t('EHPLabel')}/>
        <FilterRow name='Basic' label={t('BASICLabel')}/>
        <FilterRow name='Skill' label={t('SKILLLabel')}/>
        <FilterRow name='Ult' label={t('ULTLabel')}/>
        <FilterRow name='Fua' label={t('FUALabel')}/>
        <FilterRow name='Dot' label={t('DOTLabel')}/>
        <FilterRow name='Break' label={t('BREAKLabel')}/>
        <Flex
          style={{ height: 20, width: '100%', marginTop: -4, cursor: 'pointer' }}
          justify='space-around'
          align='flex-start'
          onClick={() => setView('Stats')}
        >
          <CaretDownOutlined/>
        </Flex>
      </Flex>
    </div>
  )
}
