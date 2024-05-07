import { Flex } from 'antd'

import { Assets } from 'lib/assets.js'
import { Constants } from 'lib/constants.ts'
import { UnreleasedSets } from 'lib/dataParser'

const GenerateOrnamentsOptions = (): { value: string; label: JSX.Element }[] => {
  return Object.values(Constants.SetsOrnaments)
    .filter(x => !UnreleasedSets[x])
    .map((x) => {
      return {
        value: x,
        label:
    <Flex gap={5} align="center">
      <img src={Assets.getSetImage(x, Constants.Parts.PlanarSphere)} style={{ width: 21, height: 21 }}></img>
      <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
        {x}
      </div>
    </Flex>,
      }
    })
}

export default GenerateOrnamentsOptions
