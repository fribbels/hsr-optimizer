import { Divider, Flex, Progress, ProgressProps, theme, Tooltip, Typography } from 'antd'
import chroma from 'chroma-js'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'
import { RelicPreview } from './RelicPreview'

interface RelicCardProps {
  relic?: Relic
  scoringCharacter?: CharacterId
  setSelectedRelicID?: (relicID: string) => void
  isSelected?: boolean
}

export const RecentRelicCard = React.memo((props: RelicCardProps): React.JSX.Element => {
  const { relic, scoringCharacter, setSelectedRelicID, isSelected } = props
  const excludedRelicPotentialCharacters = window.store((s) => s.excludedRelicPotentialCharacters)
  const { token } = theme.useToken()
  const { t } = useTranslation(['gameData', 'relicsTab'])

  // Calculate score for the selected character
  const score = useMemo(() =>
    relic && scoringCharacter ? RelicScorer.scoreCurrentRelic(relic, scoringCharacter) : undefined
  , [relic, scoringCharacter])

  // Calculate potential scores
  const potentialScore = useMemo(() =>
    relic && scoringCharacter ? RelicScorer.scoreRelicPotential(relic, scoringCharacter, true) : undefined
  , [relic, scoringCharacter])

  // Calculate top 3 characters for the relic
  const topCharacters = useMemo(() => {
    const chars = window.DB.getMetadata().characters

    return relic && (Object.keys(chars) as (keyof typeof chars)[])
      .filter((id) => !excludedRelicPotentialCharacters.includes(id))
      .map((id) => ({
        id,
        rarity: chars[id].rarity,
        name: t(`gameData:Characters.${id}.Name`),
        score: RelicScorer.scoreRelicPotential(relic, id, false),
        isSelected: id === scoringCharacter,
        icon: Assets.getCharacterAvatarById(id),
      })).sort((a, b) => {
        // Break ties by score -> rarity -> character priority
        const pctDiff = b.score.bestPct - a.score.bestPct;
        if (pctDiff !== 0) {
          return pctDiff
        }

        const rarityDiff = b.rarity - a.rarity
        if (rarityDiff !== 0) {
          return rarityDiff
        }

        const priorityDiff = (DB.getCharacterById(a.id)?.rank ?? 999) - (DB.getCharacterById(b.id)?.rank ?? 999)
        return priorityDiff
      })
      .slice(0, 5)
  }, [relic, scoringCharacter, excludedRelicPotentialCharacters, t])

  // Skip render if no relic
  if (!relic) {
    return (
      <Flex vertical>
        <RelicPreview relic={undefined}/>
      </Flex>
    )
  }

  const avgPotential = Math.floor(potentialScore?.averagePct ?? 0)
  const maxPotential = Math.floor(potentialScore?.bestPct ?? 0)

  return (
    <Flex
      vertical style={{
        border: isSelected ? `2px solid ${token.colorPrimary}` : '2px solid transparent',
        borderRadius: '8px',
        backgroundColor: isSelected ? `${token.colorPrimaryBg}` : 'transparent',
        transition: 'all 0.2s ease',
      }}
      className='recent-relic-card'
    >
      <RelicPreview
        relic={relic}
        characterId={scoringCharacter}
        score={score}
        setSelectedRelic={(relic) => setSelectedRelicID?.(relic.id)}
      />
      <Flex
        vertical
        gap={8}
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
        {potentialScore && (
          <Flex vertical gap={4}>
            <Flex align='center' justify='space-between'>
              <Typography.Text style={{
                fontSize: '11px',
                fontWeight: 600,
                color: token.colorTextSecondary,
              }}
              >
                {t('relicsTab:RecentlyUpdatedRelics.Potential') /* POTENTIAL */}
              </Typography.Text>
            </Flex>

            <Progress
              percent={maxPotential}
              success={{percent: avgPotential, strokeColor: getColorAtPercent(avgPotential)}}
              size='small'
              showInfo={false}
              strokeColor={getColorAtPercent(maxPotential)}
              trailColor={token.colorBorderSecondary}
              style={{
                lineHeight: 0,
              }}
            />

            <Flex align='center' justify='space-between'>
              <Typography.Text style={{
                fontSize: '12px',
                color: token.colorTextSecondary,
              }}
              >
                {t('relicsTab:RecentlyUpdatedRelics.Avg') /* AVG */}: <span style={{color: getColorAtPercent(avgPotential), fontWeight: 700}}>{avgPotential}%</span>
              </Typography.Text>
              <Typography.Text style={{
                fontSize: '12px',
                color: token.colorTextSecondary,
              }}
              >
                {t('relicsTab:RecentlyUpdatedRelics.Max') /* MAX */}: <span style={{color: getColorAtPercent(maxPotential), fontWeight: 700}}>{maxPotential}%</span>
              </Typography.Text>
            </Flex>
          </Flex>
        )}

        {/* Top characters potential */}
        {(topCharacters?.length ?? 0) > 0 && (
          <>
            {potentialScore && <Divider style={{ margin: '0' }}/>}

            <Flex vertical gap={4}>
              <Typography.Text style={{
                fontSize: '11px',
                fontWeight: 600,
                color: token.colorTextSecondary,
              }}
              >
                {t('relicsTab:RecentlyUpdatedRelics.BestFor') /* BEST FOR */}
              </Typography.Text>

              <Flex vertical gap={5} style={{margin: '0 -4px'}}>
                {topCharacters?.map((char) => {
                  const maxPct = Math.floor(char.score.bestPct)
                  const avgPct = Math.floor(char.score.averagePct)

                  return (
                    <Flex key={char.id} vertical style={{padding: '2px 4px'}} gap={2}>
                      <Flex
                        align='center'
                        justify='space-between'
                        style={{
                          backgroundColor: char.isSelected ? token.colorPrimaryBg : 'transparent',
                          padding: '2px 4px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => setSelectedRelicID?.(relic.id)}
                      >
                        <Flex align='center' gap={6} style={{minWidth: 0}}>
                          <img
                            src={char.icon}
                            alt={char.name}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              border: `1px solid ${token.colorBorderSecondary}`,
                            }}
                          />
                          <Typography.Text style={{
                            fontSize: '12px',
                            color: char.isSelected ? token.colorPrimary : token.colorText,
                            fontWeight: char.isSelected ? 600 : 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginRight: 2
                          }}
                          >
                            {char.name}
                          </Typography.Text>
                        </Flex>
                        <Flex align='center' gap={4}>
                          <Tooltip title='Average and maximum potential scores for this character'>
                            <Typography.Text style={{
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                            >
                              <span style={{color: getColorAtPercent(avgPct)}}>{avgPct}%</span>
                              <span style={{color: token.colorTextSecondary}}> / </span>
                              <span style={{color: getColorAtPercent(maxPct)}}>{maxPct}%</span>
                            </Typography.Text>
                          </Tooltip>
                        </Flex>
                      </Flex>

                      <Progress
                        percent={maxPct}
                        success={{percent: avgPct, strokeColor: getColorAtPercent(avgPct)}}
                        size='small'
                        showInfo={false}
                        strokeColor={getColorAtPercent(maxPct)}
                        trailColor={token.colorBorderSecondary}
                        style={{
                          lineHeight: 0,
                        }}
                      />
                    </Flex>
                  )
                })}
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  )
})

RecentRelicCard.displayName = 'RecentRelicCard'

// Modified slightly from the est tbp cards
const highRollColor = '#218cff'
const midRollColor = '#63a9ff'
const lowRollColor = '#9aa3ae'

const colorScale = chroma.scale([lowRollColor, midRollColor, highRollColor])
  .domain([20, 50, 80])
  .mode('lab');

function getColorAtPercent(percent: number) {
  percent = Math.max(0, Math.min(80, percent));
  return colorScale(percent).hex();
}

