import PropTypes from 'prop-types'
import React, { useEffect, useState, useMemo } from 'react'
import { Flex, Modal, Typography } from 'antd'
import DB from 'lib/db'

export function RelicsetModal(props) {
  useEffect(() => {
    if (!props.open) return
  }, [props.open])
  const chardata = JSON.parse(JSON.stringify(DB.getMetadata().characters))

  const closeModal = () => props.setOpen(false)

  const characterRows: {}[] = []

  const characters: string[] = useMemo(() => findCharacters(chardata), [chardata])

  function findCharacters(chardata) {
    const characters: string[] = []
    for (let id = 1; id < 9000; id++) {
      if (!chardata[id.toString()]) continue
      if (!chardata[id.toString()].scoringMetadata.simulation) continue
      console.log(chardata[id.toString()].displayName)
      characters.push(`${chardata[id.toString()].displayName}\n`)
    }
    return characters
  }

  return (
    <Modal
      open={props.open}
      width={300}
      centered
      onCancel={closeModal}
      footer={null}
    >
      <Flex>{characters}</Flex>
    </Modal>
  )
}
RelicsetModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
}
