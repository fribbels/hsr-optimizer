import {
  HoverCard,
  Text,
} from '@mantine/core'
import type { HintContent } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import classes from './TooltipImage.module.css'

export const TooltipImage = (props: { type: HintContent }) => (
  <HoverCard width={500} openDelay={200} closeDelay={100}>
    <HoverCard.Target>
      <img src={Assets.getQuestion()} style={{ width: 16, opacity: 0.6, cursor: 'pointer' }} />
    </HoverCard.Target>
    <HoverCard.Dropdown className={classes.dropdown}>
      <Text fw={600} mb={4}>{props.type.title}</Text>
      {props.type.content}
    </HoverCard.Dropdown>
  </HoverCard>
)
