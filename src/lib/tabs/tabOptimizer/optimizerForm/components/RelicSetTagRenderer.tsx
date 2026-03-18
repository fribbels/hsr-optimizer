import { Badge, Flex } from '@mantine/core'
import {
  Constants,
  RelicSetFilterOptions,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import type { ReactElement } from 'types/components'
import { decodeRelicSetValue } from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'

// NOTE: Be careful hot-reloading with this file, can cause Db to wipe. Unsure why yet
export function RelicSetTagRenderer(encodedValue: string): ReactElement {
  /*
   * The encoded value format is:
   * "4 Piece||SetName"
   * "2 + 2 Piece||Set1||Set2"
   * "2 + Any||SetName"
   */

  if (!encodedValue) {
    return (
      <Badge>
        <Flex />
      </Badge>
    )
  }

  const pieces = decodeRelicSetValue(encodedValue)
  let inner

  if (pieces[0] === RelicSetFilterOptions.relic4Piece) {
    inner = (
      <>
        <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} className={iconClasses.icon26} />
        <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} className={iconClasses.icon26} />
      </>
    )
  } else if (pieces[0] === RelicSetFilterOptions.relic2Plus2Piece) {
    inner = (
      <>
        <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} className={iconClasses.icon26} />
        <img title={pieces[2]} src={Assets.getSetImage(pieces[2], Constants.Parts.Head)} className={iconClasses.icon26} />
      </>
    )
  } else if (pieces[0] === RelicSetFilterOptions.relic2PlusAny) {
    inner = (
      <>
        <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} className={iconClasses.icon26} />
      </>
    )
  }

  return (
    <Badge
      style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 22, alignItems: 'center', overflow: 'hidden' }}
    >
      <Flex>
        {inner}
      </Flex>
    </Badge>
  )
}
