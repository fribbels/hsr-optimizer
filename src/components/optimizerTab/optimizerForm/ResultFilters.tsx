import { Flex } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import FilterRow from 'components/optimizerTab/optimizerForm/FilterRow.tsx'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants.ts'
import { CaretDownOutlined } from '@ant-design/icons'
import { useState } from 'react'

export const MinMaxStatFilters = () => {
  const [view, setView] = useState('Stats')

  return (
    <div>
      <Flex vertical gap={optimizerTabDefaultGap} style={{ display: view == 'Stats' ? 'flex' : 'none' }}>
        <Flex justify='space-between' align='center'>
          <HeaderText>Stat min / max filters</HeaderText>
          <TooltipImage type={Hint.statFilters()}/>
        </Flex>
        <Flex vertical gap={5}>
          <FilterRow name='Hp' label='HP'/>
          <FilterRow name='Atk' label='ATK'/>
          <FilterRow name='Def' label='DEF'/>
          <FilterRow name='Spd' label='SPD'/>
          <FilterRow name='Cr' label='CR'/>
          <FilterRow name='Cd' label='CD'/>
          <FilterRow name='Ehr' label='EHR'/>
          <FilterRow name='Res' label='RES'/>
          <FilterRow name='Be' label='BE'/>
          <FilterRow name='Err' label='ERR'/>
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
          <HeaderText>Rating min / max filters</HeaderText>
          <TooltipImage type={Hint.ratingFilters()}/>
        </Flex>

        <FilterRow name='Weight' label='WEIGHT'/>
        <FilterRow name='Ehp' label='EHP'/>
        <FilterRow name='Basic' label='BASIC'/>
        <FilterRow name='Skill' label='SKILL'/>
        <FilterRow name='Ult' label='ULT'/>
        <FilterRow name='Fua' label='FUA'/>
        <FilterRow name='Dot' label='DOT'/>
        <FilterRow name='Break' label='BREAK'/>
        <FilterRow name='Combo' label='COMBO'/>
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
