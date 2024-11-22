import { Flex, Form } from 'antd'
import { Hint } from 'lib/interactions/hint'
import FormStatTextStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatTextStyled'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
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
      <AlignedMinMaxFilters rows={statFilterData}/>
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
      <AlignedMinMaxFilters rows={ratingFilterData}/>
    </Flex>
  )
}

const AlignedMinMaxFilters = (props: { rows: Readonly<{ name: FilterNames; labelKey: FilterKeys }[]> }) => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'MinMaxFilters' })
  const minFilters: JSX.Element[] = []
  const maxFilters: JSX.Element[] = []
  const labels: JSX.Element[] = []
  for (const row of props.rows) {
    minFilters.push(
      <Form.Item name={`min${row.name}`} style={{ margin: 0 }}>
        <InputNumberStyled size='small' controls={false} style={{ margin: 0, width: '100%' }}/>
      </Form.Item>,
    )
    labels.push(
      <FormStatTextStyled style={{ whiteSpace: 'nowrap', height: 24 }}>{t(row.labelKey)}</FormStatTextStyled>,
    )
    maxFilters.push(
      <Form.Item name={`max${row.name}`} style={{ margin: 0 }}>
        <InputNumberStyled size='small' controls={false} style={{ margin: 0, width: '100%' }}/>
      </Form.Item>,
    )
  }
  return (
    <Flex gap={5} justify='space-between' align='center'>
      <Flex vertical gap={optimizerTabDefaultGap} style={{ minWidth: 30, maxWidth: 63 }}>
        {minFilters}
      </Flex>
      <Flex vertical gap={optimizerTabDefaultGap} style={{ width: 'max-content' }}>
        {labels}
      </Flex>
      <Flex vertical gap={optimizerTabDefaultGap} style={{ minWidth: 30, maxWidth: 63 }}>
        {maxFilters}
      </Flex>
    </Flex>
  )
}
