import { Button, Flex, Modal } from 'antd'
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types'

import { HeaderText } from './HeaderText'
import DB from 'lib/db'
import { RelicScorer } from 'lib/relicScorer'

// relic, setRelic
export default function RelicScoreModal(props) {
  const handleClose = () => {
    props.setRelic(null)
  }

  const relic = props.relic

  const numScores = 10
  let scores: [string, { bestPct: number; worstPct: number }][] | null = null
  if (relic) {
    const chars = DB.getMetadata().characters
    scores = Object.keys(chars)
      .map((id, idx) => ({
        cid: id,
        score: RelicScorer.scoreRelicPct(relic, id),
        name: chars[id].displayName,
      }))
    scores.sort((a, b) => b.score.bestPct - a.score.bestPct)
    scores = scores.slice(0, numScores)
    scores.forEach((x, idx) => {
      x.color = 'hsl(' + (idx * 360 / (numScores + 1)) + ',50%,50%)'
    })
  }

  return (
    <Modal
      width={380}
      centered
      destroyOnClose
      open={!!props.relic}
      onCancel={handleClose}
      footer={[
        <Button key="close" type="primary" onClick={handleClose}>
          Close
        </Button>,
      ]}
    >

      {relic && (
        <Flex vertical gap={5}>
          <HeaderText>Relic Optimality %</HeaderText>
          Showing the best 10 characters for this relic (characters in bold are owned)
          <ol>
            {
              scores
                .map((x) => {
                  const owned = !!DB.getCharacterById(x.cid)
                  let rect =
                    <svg width={10} height={10}>
                      <rect width={10} height={10} style={{
                        fill: x.color,
                        strokeWidth: 1,
                        stroke: "rgb(0,0,0)",
                      }} />
                    </svg>
                  return (
                    <li key={x.cid} style={owned ? { fontWeight: 'bold' } : undefined}>
                      {rect} {x.name} - {Math.round(x.score.worstPct)}% to {Math.round(x.score.bestPct)}%
                    </li>
                  )
                })
            }
          </ol>
          The plot below shows the worst, average and best case optimality when the relic is fully upgraded.
          <Plot
            data={
              scores.toReversed().map((s) => ({
                x: [s.score.averagePct],
                y: [s.name],
                mode: 'markers',
                type: 'scatter',
                error_x: {
                  type: 'data',
                  symmetric: false,
                  array: [s.score.bestPct - s.score.averagePct],
                  arrayminus: [s.score.averagePct - s.score.worstPct],
                },
                marker: { color: s.color },
                name: s.name,
              }))
            }
            layout={{
              autosize: true,
              width: 320,
              height: 240,
              margin: {
                b: 20,
                l: 20,
                r: 20,
                t: 20,
              },
              showlegend: false,

              xaxis: {
                range: [0, 100],
                tick0: 0,
                dtick: 10,
                showgrid: true,
                showline: true,
                showticklabels: true,
                type: 'linear',
                zeroline: true,
              },
              yaxis: {
                showticklabels: false,
              },
            }}
            config={{
              staticPlot: true,
            }}
          />
        </Flex>
      )}

    </Modal>
  )
}
RelicScoreModal.propTypes = {
  relic: PropTypes.object,
  setRelic: PropTypes.func,
}
