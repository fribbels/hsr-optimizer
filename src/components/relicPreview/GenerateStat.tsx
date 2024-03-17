import { Flex } from 'antd'
import { Renderer } from 'lib/renderer'
import { Assets } from 'lib/assets'
import { Utils } from 'lib/utils'
import { Constants } from 'lib/constants'
import { iconSize } from 'lib/constantsUi'
import RelicStatText from 'components/relicPreview/RelicStatText'
import { RightOutlined } from '@ant-design/icons'

const GenerateStat = (stat, main, relic) => {
  if (!stat || !stat.stat || stat.value == null) {
    return (
      <Flex justify="space-between">
        <Flex>
          <img
            src={Assets.getBlank()}
            style={{ width: iconSize, height: iconSize, marginRight: 3 }}
          >
          </img>
        </Flex>
      </Flex>
    )
  }

  let displayValue
  if (main) {
    displayValue = Renderer.renderMainStatNumber(stat)
  } else {
    displayValue = Renderer.renderSubstatNumber(stat, relic)
  }
  displayValue += Utils.isFlat(stat.stat) ? '' : '%'

  return (
    <Flex justify="space-between">
      <Flex>
        <img
          src={Assets.getStatIcon(stat.stat)}
          style={{ width: iconSize, height: iconSize, marginRight: 3 }}
        >
        </img>
        <RelicStatText>{Constants.StatsToReadable[stat.stat]}</RelicStatText>
      </Flex>
      <Flex>
        {stat.rolls
        && Object.entries(stat.rolls).map(([key, count]) => (
          <Flex
            key={key || 'none'}
            style={{
              color:
                  key === 'high' ? 'green' : key === 'mid' ? 'orange' : 'red',
            }}
          >
            {Array(count).fill(<RightOutlined />)}
          </Flex>
        ))}
        <RelicStatText>{displayValue}</RelicStatText>
      </Flex>
    </Flex>
  )
}

export default GenerateStat
