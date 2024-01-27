import React, { FC } from "react";
import { string } from "prop-types";
import { Popover, Typography } from "antd";
const { Text } = Typography;

const WithPopover = (WrappedComponent: FC) => {
  const Wrapped = (props) => {
    const [open, setOpen] = React.useState(false);
    const hide = () => setOpen(false);
    const handleOpenChange = (newOpen: boolean) => { setOpen(newOpen); }
    const content =
      <Text style={{ width: 400, display: 'block' }}>
        <hr />
        {props.content}
        <hr />
        <a onClick={hide}>Close</a>
      </Text>;

    return (
      <Popover
        trigger="hover"
        placement="left"
        content={content}
        title={props.title}
        open={open}
        onOpenChange={handleOpenChange}
      >
        <span style={{ cursor: 'pointer' }}>{WrappedComponent(props)}</span>
      </Popover>
    );
  };
  Wrapped.displayName = 'WithPopoverWrapped';
  Wrapped.propTypes = WithPopover.propTypes
  return Wrapped;
};

WithPopover.displayName = 'WithPopover';
WithPopover.propTypes = {
  title: string,
  content: string,
};
export default WithPopover;