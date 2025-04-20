import { Flex, Typography, theme, Progress } from "antd"

import { useScannerState } from "../tabImport/ScannerWebsocketClient"
import { RelicPreview } from "./RelicPreview"
import React, { useMemo } from "react"
import { RelicScorer } from "lib/relics/relicScorerPotential"

function padArray<T>(array: T[], length: number, filler: T): T[] {
  return [...array, ...Array(length - array.length).fill(filler)]
}

export const RecentRelics = React.memo((props: {
  scoringCharacter?: string
  setSelectedRelicID?: (relicID: string) => void
}): React.JSX.Element => {
    const { token } = theme.useToken();
    const recentRelicIDs = useScannerState((s) => s.recentRelics)
    const allRelics = window.store((s) => s.relicsById)
    const recentRelics = recentRelicIDs.map((id) => allRelics[id]).filter((relic) => relic != null)

    const scoredRelics = useMemo(() => {
      return Object.fromEntries(
        recentRelics.map((relic) => [
          relic.id,
          props.scoringCharacter ? RelicScorer.scoreCurrentRelic(relic, props.scoringCharacter) : undefined
        ])
      )
    }, [recentRelics, props.scoringCharacter])

    const potentialScores = useMemo(() => {
      return Object.fromEntries(
        recentRelics.map((relic) => [
          relic.id,
          props.scoringCharacter ? RelicScorer.scoreRelicPotential(relic, props.scoringCharacter, true) : undefined
        ])
      )
    }, [recentRelics, props.scoringCharacter])

    // Get quality color
    const getQualityColor = (percent: number) => {
      if (percent >= 90) return "#fdcb6e";
      if (percent >= 75) return "#6c5ce7";
      if (percent >= 60) return "#0984e3";
      if (percent >= 45) return "#00b894";
      return "#95a5a6";
    };

    return (<>
        <Flex
            gap={10}
            justify="space-evenly"
            style={{
                paddingTop: 20,
                paddingBottom: 20,
            }}
        >
            {
                padArray(recentRelics.slice(0, 6), 6, undefined).map((relic, i) => {
                  const avgPotential = relic ? Math.floor(potentialScores[relic.id]?.averagePct || 0) : 0;
                  const maxPotential = relic ? Math.floor(potentialScores[relic.id]?.bestPct || 0) : 0;
                  const qualityColor = getQualityColor(maxPotential);
                  
                  return (
                    <Flex key={relic?.id ?? i} vertical>
                      <RelicPreview 
                          relic={relic}
                          characterId={props.scoringCharacter}
                          score={relic ? scoredRelics[relic.id] : undefined}
                          setSelectedRelic={(relic) => props.setSelectedRelicID?.(relic.id)}                    
                      />
                      {relic && potentialScores[relic.id] && (
                        <Flex 
                          vertical
                          style={{
                            width: 200,
                            backgroundColor: token.colorBgContainer,
                            borderRadius: '0 0 6px 6px',
                            padding: '8px 12px',
                            marginTop: -4,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            borderTop: 'none',
                          }}
                        >
                          <Flex align="center" justify="space-between" style={{ marginBottom: 4 }}>
                            <Typography.Text style={{ 
                              fontSize: '11px', 
                              fontWeight: 600,
                              color: token.colorTextSecondary,
                            }}>
                              POTENTIAL
                            </Typography.Text>
                            <Typography.Text style={{ 
                              fontSize: '12px', 
                              fontWeight: 700,
                              color: qualityColor,
                            }}>
                              {maxPotential}%
                            </Typography.Text>
                          </Flex>
                          
                          <Progress 
                            percent={maxPotential} 
                            size="small" 
                            showInfo={false}
                            strokeColor={qualityColor}
                            trailColor={token.colorBorderSecondary}
                            style={{ 
                              margin: '3px 0',
                              padding: 0,
                              lineHeight: 0,
                            }}
                          />
                          
                          <Flex align="center" justify="space-between" style={{ marginTop: 4 }}>
                            <Typography.Text style={{ 
                              fontSize: '12px',
                              color: token.colorTextSecondary,
                            }}>
                              AVG: {avgPotential}%
                            </Typography.Text>
                            <Typography.Text style={{ 
                              fontSize: '12px',
                              color: token.colorTextSecondary,
                            }}>
                              MAX: {maxPotential}%
                            </Typography.Text>
                          </Flex>
                        </Flex>
                      )}
                    </Flex>
                  )
                })
            }
        </Flex>
      </>
    )
})
RecentRelics.displayName = 'RecentRelics'
