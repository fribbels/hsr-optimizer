import { Flex } from 'antd'
import i18next from 'i18next'
import { DamageBreakdown, DefaultActionDamageValues } from 'lib/optimization/computedStatsArray'
import { DAMAGE_SPLITS_CHART_HEIGHT, DAMAGE_SPLITS_CHART_WIDTH } from 'lib/tabs/tabOptimizer/analysis/DamageSplits'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, LabelList, Legend, Tooltip, XAxis, YAxis } from 'recharts'

type DamageBreakdownKeys = Exclude<keyof DamageBreakdown, 'name'>

const keys: DamageBreakdownKeys[] = [
  'abilityDmg',
  'dotDmg',
  'superBreakDmg',
  'jointDmg',
  'memoDmg',
  'additionalDmg',
  'breakDmg',
  'trueDmg',
]

type SummedDamageBreakdown = DamageBreakdown & { sum: number }

const chartColor = '#DDD'

export function DamageSplitsChart(props: {
  data: DamageBreakdown[]
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageSplits' })
  const [barHovered, setBarHovered] = useState<string | null>(null)

  const data = props.data
  const filteredData: SummedDamageBreakdown[] = data.filter((row) =>
    keys.some((key) => row[key] !== 0), // Keep only rows with non-zero values
  ).map((item) => {
    const summed = item as SummedDamageBreakdown
    let sum = 0
    for (const key of keys) {
      sum += item[key] ?? 0
    }
    summed.sum = sum
    return summed
  })

  let maxValue = 0
  filteredData.sort((a, b) => {
    const sumA = Object.values(a)
      .filter((value): value is number => typeof value === 'number')
      .reduce((n, store) => n + store, 0)

    const sumB = Object.values(b)
      .filter((value): value is number => typeof value === 'number')
      .reduce((n, store) => n + store, 0)

    if (sumA > maxValue) maxValue = sumA
    if (sumB > maxValue) maxValue = sumB

    return sumB - sumA
  })

  return (

    <Flex justify='center' className='pre-font'>
      <span style={{ position: 'absolute', marginTop: 20, fontSize: 14 }}>
        {t('Title')/* Damage Type Distribution */}
      </span>
      <BarChart
        layout='vertical'
        data={filteredData}
        margin={{
          top: 50,
          right: 60,
          bottom: 20,
          left: 70,
        }}
        barCategoryGap='25%'
        width={DAMAGE_SPLITS_CHART_WIDTH}
        height={DAMAGE_SPLITS_CHART_HEIGHT}
      >
        <XAxis
          type='number'
          tick={{ fill: chartColor }}
          tickFormatter={renderThousands}
          width={100}
        />
        <YAxis
          dataKey='name'
          type='category'
          axisLine={false}
          tickLine={false}
          tick={{ fill: chartColor }}
          tickFormatter={(key: keyof DefaultActionDamageValues) => t(`YAxisLabel.${key}`)}
          tickMargin={10}
          width={20}
        />
        <Tooltip
          cursor={false}
          isAnimationActive={false}
          // @ts-ignore
          content={<CustomTooltip bar={barHovered}/>}
        />
        <Legend
          formatter={(s: DamageBreakdownKeys) => t(`Legend.${s}`)}
          wrapperStyle={{ paddingTop: 10, paddingRight: 40, paddingLeft: 40 }}
        />

        {renderBar('abilityDmg', '#85c1e9', setBarHovered)}
        {renderBar('jointDmg', '#2980b9', setBarHovered)}
        {renderBar('superBreakDmg', '#e59866', setBarHovered)}
        {renderBar('additionalDmg', '#bb8fce', setBarHovered)}
        {renderBar('dotDmg', '#45b39d', setBarHovered)}
        {renderBar('memoDmg', '#cd6155', setBarHovered)}
        {renderBar('breakDmg', '#f8c471', setBarHovered)}
        {renderBar('trueDmg', '#cacfd2', setBarHovered, true)}
      </BarChart>
    </Flex>
  )
}

function renderBar(
  dataKey: string,
  color: string,
  setBarHovered: (s: string | null) => void,
  label: boolean = false,
) {
  return (
    <Bar
      key={dataKey}
      dataKey={dataKey}
      stackId='a'
      fill={color}
      activeBar={false}
      isAnimationActive={false}
      onMouseEnter={() => setBarHovered(dataKey)}
      onMouseLeave={() => setBarHovered(null)}
    >
      {label && <LabelList dataKey='sum' position='right' formatter={renderThousands}/>}
    </Bar>
  )
}

type BarsTooltipData = {
  dataKey: string
  value: number
  payload: DamageBreakdown
}

const CustomTooltip = (props: { active: boolean; payload: BarsTooltipData[]; label: string; bar: DamageBreakdownKeys | null }) => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageSplits.TooltipText' })
  const { active, payload, bar } = props
  if (!bar || !payload || !active) {
    return null
  }

  const damageItem = payload.find((x) => x.dataKey == bar)
  if (!damageItem) return null

  return (
    <Flex
      vertical
      className='pre-font'
      style={{
        background: 'rgb(69,93,154)',
        padding: 8,
        borderRadius: 3,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 'bold' }}>{t(bar)}</span>
      <span>{localeNumberComma(Math.floor(damageItem.value))}</span>
    </Flex>
  )
}

function renderThousands(n: number) {
  return `${Math.floor(Number(n) / 1000)}${i18next.t('common:ThousandsSuffix')}`
}
