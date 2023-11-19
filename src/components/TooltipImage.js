import { Popover } from "antd";

export const TooltipImage = (props) => (
  <Popover content={props.type.content} title={props.type.title}>
    <img src={Assets.getQuestion()} style={{width: 14, opacity: 0.6}}/>
  </Popover>
)