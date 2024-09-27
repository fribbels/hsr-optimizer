import { StringToNumberMap } from 'types/Common'
import { Flex } from 'antd'
import { Stats, StatsToShort } from 'lib/constants'
import { useRef } from 'react'
import { Rose } from '@ant-design/plots'
import { Renderer as SVGRenderer } from '@antv/g-svg'

export function StatChart(props: { stats: StringToNumberMap }) {
  const plotRef = useRef()

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
    // .filter(([key, value]) => key != Stats.CR && key != Stats.CD && key != Stats.EHR && key != Stats.ATK && key != Stats.ATK_P)
    .sort((a, b) => {
      return order.indexOf(a[0]) - order.indexOf(b[0])
    })
    .sort((a, b) => b[1] - a[1])
    // .sort((a, b) => a[1] - b[1])
    .map(([key, value]) => {
      return {
        stat: StatsToShort[key].replace('%', ''),
        value: value == null ? null : value / 0.8,
      }
    })
  stats[0].value = 20

  console.log(JSON.stringify(stats))

  const config = {
    renderer: new SVGRenderer(),
    theme: 'classicDark',
    width: 240,
    height: 260,
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 0,
    paddingRight: 0,
    insetLeft: 0,
    insetRight: 0,
    radius: 1,
    data: stats,
    xField: 'stat',
    yField: 'value',
    colorField: 'stat',
    scale: {
      x: {
        padding: 0,
      },
      y: {
        type: 'linear',
        domain: [0, 20],
      },
      color: {
        palette:
          ['#79c7ff', '#69acdd', '#5a94bd', '#4b7b9e', '#3c637e', '#2d4a5f', '#1e313f', '#0f1920', '#000000'],

        // https://colorkit.co/gradient-palette/1e5296-f1f7fd/?steps=9
      },
    },
    axis: {
      x: {
        title: false,
        grid: true,
        labelFontSize: 10,
        gridStrokeOpacity: 0.2,
        gridLineDash: [0, 0],
        fill: '#33aa88',
        opacity: 1.0,
        labelFill: '#ffffff',
        labelFillOpacity: 1.5,
        labelFontFamily: 'Lucida Console',
      },
      // x: null,
      y: {
        title: false,
        tickCount: 14,
        tickFilter: (d, i) => i !== 0 && i % 2 == 0,
        direction: 'left',
        labelFontSize: 10,
        labelFill: '#ffffff',
        labelFillOpacity: 1.0,
        labelFontFamily: 'Lucida Console',
      },
    },
    legend: null,
    // labels: [
    //   {
    //     text: 'stat',
    //     position: 'outside',
    //     connectorStroke: '#777777',
    //     connectormarkerStartOffset: 5,
    //     connectorMarkerStartOffset: 5,
    //     connectorIsBillboard: true,
    //     connectorStartAngle: 100,
    //     fontSize: 12,
    //     dy: (d) => (0),
    //   },
    // ],
    animate: true,
    labels: null,
  }

  return (
    <Flex style={{ height: 270 }}>
      <Rose {...config}/>
    </Flex>
  )
}
