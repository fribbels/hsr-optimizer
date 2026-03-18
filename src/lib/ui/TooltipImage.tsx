import { Popover, Text } from '@mantine/core'
import type { HintContent } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'

export const TooltipImage = (props: { type: HintContent }) => (
  <Popover width={500}>
    <Popover.Target>
      <img src={Assets.getQuestion()} style={{ width: 16, opacity: 0.6, cursor: 'pointer' }} />
    </Popover.Target>
    <Popover.Dropdown>
      <Text fw={600} mb={4}>{props.type.title}</Text>
      {props.type.content}
    </Popover.Dropdown>
  </Popover>
)
