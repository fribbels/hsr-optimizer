import * as React from 'react';
import PropTypes from "prop-types";
import { Card, Divider, Flex, Typography } from 'antd';

import { Renderer } from "lib/renderer";
import { Assets } from "lib/assets";
import { iconSize } from 'lib/constantsUi';
import GenerateStat from 'components/relicPreview/GenerateStat';

const { Text } = Typography;

const RelicPreview = ({
  relic,
  // characterId = undefined, // CharacterPreview by way of RelicScorerTab
  score = undefined,
  source = '',
  setSelectedRelic = () => { },
  setEditModalOpen = () => { }
}) => {
  relic = {
    enhance: 0,
    part: undefined,
    set: undefined,
    grade: 0,
    substats: [],
    main: undefined,
    equippedBy: undefined,
    ...relic
  };

  const { enhance, part, set, substats, main, equippedBy } = relic;
  const relicSrc = set ? Assets.getSetImage(set, part) : Assets.getBlank()
  const equippedBySrc = equippedBy ? Assets.getCharacterAvatarById(equippedBy) : Assets.getBlank()
  const scored = relic !== undefined && score !== undefined

  const relicClicked = () => {
    if (!relic || !relic.part || !relic.set || source == 'scorer') return;

    setSelectedRelic(relic);
    setEditModalOpen(true);
  }

  return (
    <Card
      size="small"
      hoverable={source != 'scorer'}
      onClick={relicClicked}
      style={{ width: 200, height: 280 }}
    // onMouseEnter={() => setHovered(true)}
    // onMouseLeave={() => setHovered(false)}
    >
      <Flex vertical justify='space-between' style={{ height: 255 }}>
        <Flex justify='space-between' align='center'>
          <img
            style={{ height: 50, width: 50 }}
            title={set}
            src={relicSrc}
          />
          <Flex vertical align='center'>
            <Flex align='center' gap={5}>
              {Renderer.renderGrade(relic)}
              <Flex style={{ width: 30 }} justify='space-around'>
                <Text>
                  {part != undefined ? `+${enhance}` : ''}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <img
            style={{ height: 50, width: 50 }}
            src={equippedBySrc}
          />
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }} />

        {GenerateStat(main, true, relic)}

        <Divider style={{ margin: '6px 0px 6px 0px' }} />

        <Flex vertical gap={0}>
          {GenerateStat(substats[0], false, relic)}
          {GenerateStat(substats[1], false, relic)}
          {GenerateStat(substats[2], false, relic)}
          {GenerateStat(substats[3], false, relic)}
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }} />

        <Flex gap={4} justify='space-between'>
          <Flex>
            <img src={(scored) ? Assets.getStarBw() : Assets.getBlank()} style={{ width: iconSize, height: iconSize, marginRight: 3 }}></img>
            <Text>
              {(scored) ? 'Score' : ''}
            </Text>
          </Flex>
          <Text>
            {(scored) && `${score.score} (${score.rating})${score.meta.modified ? ' *' : ''}`}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
RelicPreview.propTypes = {
  relic: PropTypes.object,
  source: PropTypes.string,
  characterId: PropTypes.string,
  score: PropTypes.object,
  setEditModalOpen: PropTypes.func,
  setSelectedRelic: PropTypes.func,
}

export default RelicPreview;