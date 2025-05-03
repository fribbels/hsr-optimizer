import { Flex, Typography, theme, Progress, Tooltip, Divider } from "antd"
import React, { useMemo } from "react"
import { RelicPreview } from "./RelicPreview"
import { RelicScorer } from "lib/relics/relicScorerPotential"
import { useTranslation } from "react-i18next"
import { Assets } from "lib/rendering/assets"
import { Relic } from "types/relic"
import { CharacterId } from "types/character"

interface RelicCardProps {
  relic?: Relic;
  scoringCharacter?: CharacterId;
  setSelectedRelicID?: (relicID: string) => void;
  excludedRelicPotentialCharacters?: string[];
  isSelected?: boolean;
}

export const RecentRelicCard = React.memo((props: RelicCardProps): React.JSX.Element => {
  const { relic, scoringCharacter, setSelectedRelicID, excludedRelicPotentialCharacters, isSelected } = props;
  const { token } = theme.useToken();
  const { t } = useTranslation(['gameData']);

  // Skip calculations if no relic
  if (!relic) {
    return (
      <Flex vertical>
        <RelicPreview relic={undefined} />
      </Flex>
    );
  }

  // Calculate score for the selected character
  const score = useMemo(() => 
    scoringCharacter ? RelicScorer.scoreCurrentRelic(relic, scoringCharacter) : undefined
  , [relic, scoringCharacter]);

  // Calculate potential scores
  const potentialScore = useMemo(() => 
    scoringCharacter ? RelicScorer.scoreRelicPotential(relic, scoringCharacter, true) : undefined
  , [relic, scoringCharacter]);

  // Calculate top 3 characters for the relic
  const topCharacters = useMemo(() => {
    const chars = window.DB.getMetadata().characters;

    return Object.keys(chars)
      .filter(id => !excludedRelicPotentialCharacters?.includes(id))
      .map((id) => ({
        id,
        name: t(`Characters.${id}.Name` as any),
        score: RelicScorer.scoreRelicPotential(relic, id as CharacterId, false),
        isSelected: id === scoringCharacter,
        icon: Assets.getCharacterAvatarById(id)
      }))
      .sort((a, b) => b.score.bestPct - a.score.bestPct)
      .slice(0, 3);
  }, [relic, scoringCharacter, excludedRelicPotentialCharacters, t]);

  // Get quality color
  const getQualityColor = (percent: number) => {
    if (percent >= 90) return "#fdcb6e";
    if (percent >= 75) return "#a580ff";
    if (percent >= 60) return "#0984e3";
    if (percent >= 45) return "#00b894";
    return "#95a5a6";
  };

  const getDarkQualityColor = (percent: number) => {
    if (percent >= 90) return "#b7922e";
    if (percent >= 75) return "#7a5ebd";
    if (percent >= 60) return "#0769b3";
    if (percent >= 45) return "#00806a";
    return "#6b7778";
  };

  const avgPotential = Math.floor(potentialScore?.averagePct || 0);
  const maxPotential = Math.floor(potentialScore?.bestPct || 0);
  const avgQualityColor = getQualityColor(avgPotential);
  const maxQualityColor = getQualityColor(maxPotential);
  const darkMaxQualityColor = getDarkQualityColor(maxPotential);

  return (
    <Flex vertical style={{
      border: isSelected ? `2px solid ${token.colorPrimary}` : '2px solid transparent',
      borderRadius: '8px',
      backgroundColor: isSelected ? `${token.colorPrimaryBg}` : 'transparent',
      transition: 'all 0.2s ease',
    }}>
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
            <Flex align="center" justify="space-between">
              <Typography.Text style={{ 
                fontSize: '11px', 
                fontWeight: 600,
                color: token.colorTextSecondary,
              }}>
                POTENTIAL
              </Typography.Text>
            </Flex>
            
            <Progress 
              percent={maxPotential}
              success={{ percent: avgPotential, strokeColor: avgQualityColor }}
              size="small" 
              showInfo={false}
              strokeColor={darkMaxQualityColor}
              trailColor={token.colorBorderSecondary}
              style={{ 
                lineHeight: 0,
              }}
            />
            
            <Flex align="center" justify="space-between">
              <Typography.Text style={{ 
                fontSize: '12px',
                color: token.colorTextSecondary,
              }}>
                AVG: <span style={{ color: avgQualityColor, fontWeight: 700 }}>{avgPotential}%</span>
              </Typography.Text>
              <Typography.Text style={{ 
                fontSize: '12px',
                color: token.colorTextSecondary,
              }}>
                MAX: <span style={{ color: maxQualityColor, fontWeight: 700 }}>{maxPotential}%</span>
              </Typography.Text>
            </Flex>
          </Flex>
        )}
        
        {/* Top characters potential */}
        {topCharacters.length > 0 && (
          <>
            {potentialScore && <Divider style={{ margin: '0' }} />}
            
            <Flex vertical gap={4}>
              <Typography.Text style={{ 
                fontSize: '11px', 
                fontWeight: 600,
                color: token.colorTextSecondary,
              }}>
                BEST FOR
              </Typography.Text>
              
              <Flex vertical gap={2} style={{ margin: '0 -4px' }}>
                {topCharacters.map((char) => {
                  const maxPct = Math.floor(char.score.bestPct);
                  const avgPct = Math.floor(char.score.averagePct);
                  const maxColor = getQualityColor(maxPct);
                  const avgColor = getQualityColor(avgPct);
                  
                  return (
                    <Flex 
                      align="center" 
                      justify="space-between"
                      style={{
                        backgroundColor: char.isSelected ? token.colorPrimaryBg : 'transparent',
                        padding: '2px 4px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => setSelectedRelicID?.(relic.id)}
                    >
                      <Flex align="center" gap={6} style={{
                        minWidth: 0
                      }}>
                        <img
                          src={char.icon} 
                          alt={char.name}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: `1px solid ${token.colorBorderSecondary}`
                          }}
                        />
                        <Typography.Text style={{ 
                          fontSize: '12px',
                          color: char.isSelected ? token.colorPrimary : token.colorText,
                          fontWeight: char.isSelected ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {char.name}
                        </Typography.Text>
                      </Flex>
                      <Flex align="center" gap={4}>
                        <Tooltip title="Average and maximum potential scores for this character">
                          <Typography.Text style={{ 
                            fontSize: '12px',
                            fontWeight: 600,
                          }}>
                            <span style={{ color: avgColor }}>{avgPct}%</span>
                            <span style={{ color: token.colorTextSecondary }}> / </span>
                            <span style={{ color: maxColor }}>{maxPct}%</span>
                          </Typography.Text>
                        </Tooltip>
                      </Flex>
                    </Flex>
                  );
                })}
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
});

RecentRelicCard.displayName = 'RelicCard'; 