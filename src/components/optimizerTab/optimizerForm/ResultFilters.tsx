import { Flex } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import FilterRow from 'components/optimizerTab/optimizerForm/FilterRow.tsx'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants.ts'

export const MinMaxStatFilters = () => {
  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify="space-between" align="center">
        <HeaderText>Stat filters</HeaderText>
        <TooltipImage type={Hint.statFilters()}/>
      </Flex>
      <Flex vertical gap={5}>
        <FilterRow name="Hp" label="HP"/>
        <FilterRow name="Atk" label="ATK"/>
        <FilterRow name="Def" label="DEF"/>
        <FilterRow name="Spd" label="SPD"/>
        <FilterRow name="Cr" label="CR"/>
        <FilterRow name="Cd" label="CD"/>
        <FilterRow name="Ehr" label="EHR"/>
        <FilterRow name="Res" label="RES"/>
        <FilterRow name="Be" label="BE"/>
        <FilterRow name="Err" label="ERR"/>
      </Flex>
    </Flex>
  )
}

export const MinMaxRatingFilters = () => {
  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify="space-between" align="center">
        <HeaderText>Rating filters</HeaderText>
        <TooltipImage type={Hint.ratingFilters()}/>
      </Flex>

      <FilterRow name="Weight" label="WEIGHT"/>
      <FilterRow name="Ehp" label="EHP"/>
      <FilterRow name="Basic" label="BASIC"/>
      <FilterRow name="Skill" label="SKILL"/>
      <FilterRow name="Ult" label="ULT"/>
      <FilterRow name="Fua" label="FUA"/>
      <FilterRow name="Dot" label="DOT"/>
      <FilterRow name="Break" label="BREAK"/>
      <FilterRow name="Combo" label="COMBO"/>
    </Flex>
  )
}
