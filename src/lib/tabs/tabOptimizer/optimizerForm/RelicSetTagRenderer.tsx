import { Flex, Tag } from 'antd'
import { Constants, RelicSetFilterOptions } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import React from 'react'

// NOTE: Be careful hot-reloading with this file, can cause Db to wipe. Unsure why yet
export function RelicSetTagRenderer(props: {
  value: string
  label: string
  closable: boolean
  onClose: () => void
}) {
  const { value, closable, onClose } = props

  /*
   * The value comes in as:
   * "2 PieceBand of Sizzling Thunder__RC_CASCADER_SPLIT__Guard of Wuthering Snow"
   */
  /*
   *['4 Piece', 'Passerby of Wandering Cloud']
   *['2 + 2 Piece', 'Knight of Purity Palace', 'Hunter of Glacial Forest']
   *['2 + Any', 'Knight of Purity Palace']
   */

  if (!value) return (
    <Tag
      closable={closable}
      onClose={onClose}
    >
      <Flex>
        {(props.label || '').replace(/[^0-9+]/g, '')}
      </Flex>
    </Tag>
  )

  const pieces = value.split('__RC_CASCADER_SPLIT__')
  let inner

  if (pieces[0] == RelicSetFilterOptions.relic4Piece) {
    inner = (
      <React.Fragment>
        <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
        <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
      </React.Fragment>
    )
  }

  if (pieces[0] == RelicSetFilterOptions.relic2Plus2Piece) {
    inner = (
      <React.Fragment>
        <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
        <img title={pieces[2]} src={Assets.getSetImage(pieces[2], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
      </React.Fragment>
    )
  }

  if (pieces[0] == RelicSetFilterOptions.relic2PlusAny) {
    inner = (
      <React.Fragment>
        <img title={pieces[1]} src={Assets.getSetImage(pieces[1], Constants.Parts.Head)} style={{ width: 26, height: 26 }}></img>
      </React.Fragment>
    )
  }

  return (
    <Tag
      closable={false}
      onClose={onClose}
      style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 22, alignItems: 'center', overflow: 'hidden' }}
    >
      <Flex>
        {inner}
      </Flex>
    </Tag>
  )
}
