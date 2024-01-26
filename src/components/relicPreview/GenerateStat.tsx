import * as React from 'react';
import { Flex, Typography } from 'antd';

import { Renderer } from "lib/renderer";
import { Assets } from "lib/assets";
import { Utils } from "lib/utils";
import { Constants } from "lib/constants";
import { iconSize } from 'lib/constantsUi';

const { Text } = Typography;
const GenerateStat = (stat, main, relic) => {
  if (!stat || !stat.stat || stat.value == null) {
    return (
      <Flex justify='space-between'>
        <Flex>
          <img src={Assets.getBlank()} style={{ width: iconSize, height: iconSize, marginRight: 3 }}></img>
        </Flex>
      </Flex>
    )
  }

  let displayValue;
  if (main) {
    displayValue = Renderer.renderMainStatNumber(stat)
  } else {
    displayValue = Renderer.renderSubstatNumber(stat, relic)
  }
  displayValue += Utils.isFlat(stat.stat) ? '' : '%'

  return (
    <Flex justify='space-between'>
      <Flex>
        <img src={Assets.getStatIcon(stat.stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}></img>
        <Text>
          {Constants.StatsToReadable[stat.stat]}
        </Text>
      </Flex>
      <Text>
        {displayValue}
      </Text>
    </Flex>
  )
}

export default GenerateStat;