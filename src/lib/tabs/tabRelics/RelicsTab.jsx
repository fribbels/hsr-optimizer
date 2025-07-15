import {
  Collapse,
  Flex,
  theme,
} from 'antd'
import {
  Stats,
} from 'lib/constants/constants'

import { OpenCloseIDs } from 'lib/hooks/useOpenClose'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import { RecentRelics } from 'lib/tabs/tabRelics/RecentRelics'
import Plotly from 'plotly.js/dist/plotly-basic'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import createPlotlyComponent from 'react-plotly.js/factory'
import { useScannerState } from '../tabImport/ScannerWebsocketClient'

const Plot = createPlotlyComponent(Plotly)

const { useToken } = theme

const PLOT_ALL = 'PLOT_ALL'
const PLOT_CUSTOM = 'PLOT_CUSTOM'

const TAB_WIDTH = 1460

export default function RelicsTab() {
  const { token } = useToken()

  // TODO: This is currently rerendering the whole tab on every relic click, revisit
  console.log('======================================================================= RENDER RelicsTab')
  const gridRef = useRef()

  const [selectedRelicID, setSelectedRelicID] = useState()
  window.setSelectedRelicIDs = (ids) => {
    setSelectedRelicID(ids[0])

    // Ensure the grid is updated with the latest data
    window.relicsGrid.current.api.updateGridOptions({ rowData: DB.getRelics() })

    // Get the row nodes for the selected relics
    const rowNodes = ids.map((id) => window.relicsGrid.current?.api.getRowNode(id)).filter((x) => x)

    // Deselect all rows
    window.relicsGrid.current.api.deselectAll()

    // Select the new rows
    window.relicsGrid.current.api.setNodesSelected({ nodes: rowNodes, newValue: true, source: 'api' })

    // Ensure the new rows are visible
    window.relicsGrid.current.api.ensureNodeVisible(rowNodes[0])

    if (rowNodes.length > 1) {
      window.relicsGrid.current.api.ensureNodeVisible(rowNodes[rowNodes.length - 1])
    }
  }

  // TODO: Can/should we memoize these?
  const selectedRelic = DB.getRelicById(selectedRelicID)
  const [plottedCharacterType, setPlottedCharacterType] = useState(PLOT_CUSTOM)
  const [relicInsight, setRelicInsight] = useState('buckets')

  const hasRecentRelics = useScannerState((s) => s.recentRelics.length > 0)

  const { t, i18n } = useTranslation(['relicsTab', 'common', 'gameData'])

  const focusCharacter = window.store.getState().relicsTabFocusCharacter

  const numScores = 10
  const [scores, setScores] = useState(null)
  const [scoreBuckets, setScoreBuckets] = useState(null)
  const excludedRelicPotentialCharacters = window.store((s) => s.excludedRelicPotentialCharacters)
  useEffect(() => {
    if (selectedRelic) {
      const chars = DB.getMetadata().characters
      const allScores = Object.keys(chars)
        .filter((id) => !(plottedCharacterType === PLOT_CUSTOM && excludedRelicPotentialCharacters.includes(id)))
        .map((id) => ({
          cid: id,
          name: t(`gameData:Characters.${id}.Name`),
          score: RelicScorer.scoreRelicPotential(selectedRelic, id, true),
          color: '#000',
          owned: !!DB.getCharacterById(id),
        }))

      allScores.sort((a, b) => b.score.bestPct - a.score.bestPct)
      allScores.forEach((x, idx) => {
        x.color = 'hsl(' + (idx * 360 / (numScores + 1)) + ',50%,50%)'
      })
      setScores(allScores.slice(0, numScores))

      //        0+  10+ 20+ 30+ 40+ 50+ 60+ 70+ 80+ 90+
      const sb = [[], [], [], [], [], [], [], [], [], []]
      for (const score of allScores) {
        let lowerBound = Math.floor(score.score.bestPct / 10)
        lowerBound = Math.min(9, Math.max(0, lowerBound))
        sb[lowerBound].push(score)
      }
      sb.forEach((bucket) => bucket.sort((s1, s2) => s1.name.localeCompare(s2.name)))
      setScoreBuckets(sb)
    }
  }, [plottedCharacterType, selectedRelic, excludedRelicPotentialCharacters, t])

  return (
    <Flex style={{ width: TAB_WIDTH, marginBottom: 100 }}>
      <Flex gap={10}>
        {relicInsight === 'top10' && scores && (
          <Flex gap={10}>
            <Flex style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${token.colorBorderSecondary}` }}>
              <Plot
                onClick={(e) => {
                  store.getState().setScoringAlgorithmFocusCharacter(e.points[0].data.cid)
                  setOpen(OpenCloseIDs.SCORING_MODAL)
                }}
                data={scores.map((s) => ({
                  x: [s.score.averagePct],
                  y: [s.name],
                  hoverinfo: 'name',
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
                  cid: s.cid,
                })).reverse()}
                layout={{
                  plot_bgcolor: 'rgba(0, 0, 0, 0)',
                  paper_bgcolor: token.colorBgContainer,
                  font: {
                    color: 'rgba(255, 255, 255, 0.85)',
                  },
                  autosize: true,
                  width: 320,
                  height: 278,
                  margin: {
                    b: 20,
                    l: 10,
                    r: 20,
                    t: 10,
                  },
                  showlegend: false,
                  xaxis: {
                    fixedrange: true,
                    range: [0, 100],
                    tick0: 0,
                    dtick: 10,
                    showgrid: true,
                    showline: true,
                    showticklabels: true,
                    type: 'linear',
                    zeroline: true,
                    gridcolor: 'rgba(128, 128, 128, 0.15)',
                  },
                  yaxis: {
                    fixedrange: true,
                    showticklabels: false,
                    gridcolor: 'rgba(128, 128, 128, 0.15)',
                  },
                }}
                config={{
                  displayModeBar: false,
                  editable: false,
                  scrollZoom: false,
                }}
              />
            </Flex>
            <ol>
              <Flex vertical gap={5.5}>
                {scores
                  .map((x) => {
                    const rect = (
                      <svg width={10} height={10}>
                        <rect
                          width={10}
                          height={10}
                          style={{
                            fill: x.color,
                            strokeWidth: 1,
                            stroke: 'rgb(0,0,0)',
                          }}
                        />
                      </svg>
                    )
                    const worstPct = Math.floor(x.score.worstPct)
                    const bestPct = Math.floor(x.score.bestPct)
                    const pctText = worstPct === bestPct ? `${worstPct}%` : `${worstPct}% - ${bestPct}%`
                    return (
                      <Flex key={x.cid} gap={4}>
                        <li style={x.owned ? { fontWeight: 'bold' } : undefined}>
                          <Flex align='center' gap={8}>
                            {rect}
                            <a style={{ height: '19px' }}>
                              {/* 20 px is too big and pushes the characters below the lower edge of the plot */}
                              <img
                                src={Assets.getCharacterAvatarById(x.cid)}
                                style={{ height: '19px' }}
                                onClick={(e) => {
                                  store.getState().setScoringAlgorithmFocusCharacter(e.target.attributes.src.nodeValue.split('avatar/')[1].split('.webp')[0])
                                  setOpen(OpenCloseIDs.SCORING_MODAL)
                                }}
                              />
                            </a>
                            {x.name}: {pctText}
                          </Flex>
                        </li>
                      </Flex>
                    )
                  })}
              </Flex>
            </ol>
          </Flex>
        )}
        <Flex style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${token.colorBorderSecondary}` }}>
          {relicInsight === 'buckets' && scoreBuckets && (
            // Since plotly doesn't natively support images as points, we emulate it in this plot
            // by adding invisible points for each character (to get 'name on hover' behavior),
            // then adding an image on top of each point
            <Plot
              onClick={(e) => {
                store.getState().setScoringAlgorithmFocusCharacter(e.points[0].data.cid[e.points[0].pointIndex])
                setOpen(OpenCloseIDs.SCORING_MODAL)
              }}
              data={[
                // Add fake data in each category to make sure we don't elide any categories - that would
                // mess up our image placement
                {
                  type: 'scatter',
                  x: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  y: ['0%+', '10%+', '20%+', '30%+', '40%+', '50%+', '60%+', '70%+', '80%+', '90%+'],
                  hoverinfo: 'skip',
                  mode: 'markers',
                  marker: {
                    color: 'rgba(0, 0, 0, 0)',
                    symbol: 'circle',
                    size: 16,
                  },
                },
                {
                  type: 'scatter',
                  hoverinfo: 'text',
                  mode: 'markers',
                  x: scoreBuckets.flatMap((bucket, _bucketIdx) => bucket.map((_score, idx) => idx + 0.5)),
                  y: scoreBuckets.flatMap((bucket, bucketIdx) => bucket.map((_score, _idx) => (bucketIdx * 10) + '%+')),
                  hovertext: scoreBuckets.flatMap((bucket, _bucketIdx) =>
                    bucket.map((score, _idx) =>
                      [
                        score.name,
                        score.score.meta.bestAddedStats.length === 0
                          ? ''
                          : t('RelicInsights.NewStats') /* 'New stats: ' */ + score.score.meta.bestAddedStats.join(' / '),
                        score.score.meta.bestUpgradedStats == null
                          ? ''
                          : t('RelicInsights.UpgradedStats') /* 'Upgraded stats: ' */ + score.score.meta.bestUpgradedStats.join(' / '),
                      ].filter((t) => t !== '').join('<br>')
                    )
                  ),
                  cid: scoreBuckets.flatMap((bucket, _bucketIdx) => bucket.map((score, _idx) => score.cid)),
                  marker: {
                    color: 'rgba(0, 0, 0, 0)', // change to 1 to see backing points
                    symbol: 'circle',
                    size: 16,
                  },
                },
              ]}
              layout={{
                plot_bgcolor: 'rgba(0, 0, 0, 0)',
                paper_bgcolor: token.colorBgContainer,
                font: {
                  color: 'rgba(255, 255, 255, 0.85)',
                },
                autosize: true,
                height: 278,
                width: 1222,
                margin: {
                  b: 5,
                  l: 50,
                  r: 20,
                  t: 0,
                },
                hovermode: 'closest',
                hoverdistance: 20,
                showlegend: false,
                images: scoreBuckets.flatMap((bucket, bucketIdx) =>
                  bucket.map((score, idx) => ({
                    source: Assets.getCharacterAvatarById(score.cid),
                    xref: 'x',
                    yref: 'y',
                    x: idx + 0.6,
                    y: bucketIdx,
                    sizex: 1,
                    sizey: 1,
                    xanchor: 'center',
                    yanchor: 'middle',
                  }))
                ),
                xaxis: {
                  fixedrange: true,
                  range: [0, Math.max(...scoreBuckets.map((sb) => sb.length)) + 1],
                  tick0: 0,
                  showgrid: false,
                  showticklabels: false,
                  type: 'linear',
                  zeroline: false,
                },
                yaxis: {
                  fixedrange: true,
                  showticklabels: true,
                  gridcolor: 'rgba(128, 128, 128, 0.15)',
                },
              }}
              config={{
                displayModeBar: false,
                editable: false,
                scrollZoom: false,
              }}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  )
}
// RelicsTab.propTypes = {
//   active: PropTypes.bool,
// }

function cvValueGetter(params) {
  return params.data.augmentedStats[Stats.CR] * 2 + params.data.augmentedStats[Stats.CD]
}
