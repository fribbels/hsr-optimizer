import { Flex } from 'antd'
import i18next from 'i18next'

import { Assets } from 'lib/assets.js'
import { Constants, setToId, UnreleasedSets } from 'lib/constants'

// This should be memoised with either the t function or resolved language as a dependency
const GenerateOrnamentsOptions = (): { value: string; label: JSX.Element }[] => {
  return Object.values(Constants.SetsOrnaments)
    .filter((x) => !UnreleasedSets[x])
    .map((x) => {
      return {
        value: x,
        label:
  <Flex gap={5} align='center'>
    <img src={Assets.getSetImage(x, Constants.Parts.PlanarSphere)} style={{ width: 21, height: 21 }}></img>
    <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
      {i18next.t(`common:RelicSets.${setToId[x]}.Name`)}
    </div>
  </Flex>,
      }
    })
}

export default GenerateOrnamentsOptions
