import { Button, Flex, Modal } from 'antd'
import PropTypes from 'prop-types'

import { HeaderText } from './HeaderText'
import DB from 'lib/db'
import { RelicScorer } from 'lib/relicScorer'

// relic, setRelic
export default function RelicScoreModal(props) {
  const handleClose = () => {
    props.setRelic(null)
  }

  const relic = props.relic

  return (
    <Modal
      width={650}
      centered
      destroyOnClose
      open={!!props.relic}
      onCancel={handleClose}
      footer={[
        <Button key="close" type="primary" onClick={handleClose}>
          Close
        </Button>,
      ]}
    >

      {relic && (
        <Flex vertical gap={5}>
          <HeaderText>Relic Optimality %</HeaderText>
          <ol>
            {(() => {
              const chars = DB.getMetadata().characters
              const scores: [string, { bestPct: number; worstPct: number }][] = Object.keys(chars)
                .map((id) => [id, RelicScorer.scoreRelicPct(relic, id)])
              scores.sort((a, b) => b[1].bestPct - a[1].bestPct)
              const elts = scores
                .slice(0, 10)
                .map(([c, s]) => {
                  const owned = !!DB.getCharacterById(c)
                  return (
                    <li key={c} style={owned ? { fontWeight: 'bold' } : undefined}>
                      {chars[c].displayName} - {s.worstPct.toFixed(1)}% to {s.bestPct.toFixed(1)}%
                    </li>
                  )
                })
              return elts
            })()}
          </ol>
        </Flex>
      )}

    </Modal>
  )
}
RelicScoreModal.propTypes = {
  relic: PropTypes.object,
  setRelic: PropTypes.func,
}
