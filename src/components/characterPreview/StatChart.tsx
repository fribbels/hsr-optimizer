import { StringToNumberMap } from 'types/Common'
import { ResponsiveRadar } from '@nivo/radar'
import { Flex } from 'antd'
import { Stats, StatsToShort } from 'lib/constants'

export function StatChart(props: { stats: StringToNumberMap }) {
  const data = [
    {
      stat: 'BE',
      value: 0.9,
    },
    {
      stat: 'SPD',
      value: 0.6,
    },
    {
      stat: 'HP',
      value: 0.5,
    },
    {
      stat: 'DEF',
      value: 0.4,
    },
    {
      stat: 'RES',
      value: 0.2,
    },
    {
      stat: 'ATK',
      value: 0.1,
    },
    {
      stat: 'CR',
      value: 0,
    },
    {
      stat: 'CD',
      value: 0.07,
    },
    {
      stat: 'EHR',
      value: 0.15,
    },
  ]

  const order = [
    Stats.BE,
    Stats.SPD,
    Stats.HP_P,
    Stats.DEF_P,
    Stats.RES,
    Stats.ATK_P,
    Stats.CR,
    Stats.CD,
    Stats.EHR,
  ] // The desired order of keys

  const stats = Object.entries(props.stats)
    .filter(([key, value]) => key != Stats.DEF && key != Stats.HP && key != Stats.ATK)
    .sort((a, b) => {
      return order.indexOf(a[0]) - order.indexOf(b[0])
    })
    .map(([key, value]) => {
      return {
        stat: StatsToShort[key],
        value: value || 0,
      }
    })

  return (
    <Flex style={{ height: 200 }}>
      <ResponsiveRadar
        data={stats}
        keys={['value']}
        indexBy='stat'
        margin={{ top: 30, right: 30, bottom: 20, left: 30 }}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        colors={{ scheme: 'nivo' }}
        motionConfig='slow'
        maxValue={10}
        gridShape='linear'
        gridLevels={6}
        borderWidth={1}
        theme={{
          text: {
            fontSize: 11,
            fill: '#dddddd',
          },
          grid: {
            line: {
              stroke: '#77777777',
              strokeWidth: 0.5,
            },
          },
          tooltip: {
            wrapper: {},
            container: {
              color: '#333333',
              fontSize: 12,
            },
          },
        }}
      />

    </Flex>
  )
}
