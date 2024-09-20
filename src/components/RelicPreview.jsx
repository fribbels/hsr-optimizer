import PropTypes from 'prop-types'
import { Card, Divider, Flex } from 'antd'

import { Renderer } from 'lib/renderer'
import { Assets } from 'lib/assets'
import { iconSize } from 'lib/constantsUi'
import RelicStatText from 'components/relicPreview/RelicStatText'
import { GenerateStat } from 'components/relicPreview/GenerateStat'
import { useTranslation } from 'react-i18next'

const RelicPreview = ({
  relic,
  characterId = undefined,
  score,
  source = '',
  setSelectedRelic = () => {
  },
  setEditModalOpen = () => {
  },
  setAddModelOpen = () => {
  },
}) => {
  relic = {
    enhance: 0,
    part: undefined,
    set: undefined,
    grade: 0,
    substats: [],
    main: undefined,
    equippedBy: undefined,
    ...relic,
  }

  const { t } = useTranslation('common')

  const { enhance, part, set, substats, main, equippedBy, id } = relic
  const relicSrc = set ? Assets.getSetImage(set, part) : Assets.getBlank()
  const equippedBySrc = equippedBy ? Assets.getCharacterAvatarById(equippedBy) : Assets.getBlank()
  const scored = relic !== undefined && score !== undefined

  const cardClicked = () => {
    if ((!id && !characterId) || source === 'scorer' || source === 'builds') return

    if (!id) {
      console.log(`Add new relic for characterId=${characterId}.`)
      relic.equippedBy = characterId
      relic.enhance = 15
      relic.grade = 5
      setSelectedRelic(relic)
      setAddModelOpen(true)
    } else {
      setSelectedRelic(relic)
      setEditModalOpen(true)
    }
  }

  return (
    <Card
      size='small'
      hoverable={source != 'scorer' && source != 'builds'}
      onClick={cardClicked}
      style={{ width: 200, height: 280 }}
      /*
       * onMouseEnter={() => setHovered(true)}
       * onMouseLeave={() => setHovered(false)}
       */
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
                <RelicStatText>
                  {id != undefined ? `+${enhance}` : ''}
                </RelicStatText>
              </Flex>
            </Flex>
          </Flex>
          <img
            style={{ height: 50, width: 50 }}
            src={equippedBySrc}
          />
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        {GenerateStat(main, true, relic)}

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        <Flex vertical gap={0}>
          {GenerateStat(substats[0], false, relic)}
          {GenerateStat(substats[1], false, relic)}
          {GenerateStat(substats[2], false, relic)}
          {GenerateStat(substats[3], false, relic)}
        </Flex>

        <Divider style={{ margin: '6px 0px 6px 0px' }}/>

        <Flex justify='space-between'>
          <Flex>
            <img src={(scored) ? Assets.getStarBw() : Assets.getBlank()} style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}></img>
            <RelicStatText>
              {(scored) ? t('Score', { capitalizeLength: 1 }) : ''}
            </RelicStatText>
          </Flex>
          <RelicStatText>
            {(scored) ? `${score.score} (${score.rating})${score.meta?.modified ? ' *' : ''}` : ''}
          </RelicStatText>
        </Flex>
      </Flex>
    </Card>
  )
}
RelicPreview.propTypes = {
  relic: PropTypes.object,
  source: PropTypes.string,
  characterId: PropTypes.string,
  score: PropTypes.object,
  setEditModalOpen: PropTypes.func,
  setSelectedRelic: PropTypes.func,
}

export default RelicPreview
