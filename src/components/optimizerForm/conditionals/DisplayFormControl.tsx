import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'antd';
import ColorizeNumbers from 'components/common/ColorizeNumbers';

const DisplayFormControl = ({ content, teammateIndex }): JSX.Element => {
  const ret = [];
  let i = 0;

  if (!content || content.length === 0) {
    ret.push(<div key={i++}>No conditional passives</div>);
  } else {
    content.forEach(passive => {
      const Item = passive.formItem;
      passive.teammateIndex = teammateIndex

      ret.push(
        <Item
          {...passive}
          name={passive.id}
          title={passive.title}
          content={ColorizeNumbers(passive.content)}
          text={passive.text}
          key={i++}
          />
      );
      i++;
    });
  }

  return (<Flex vertical gap={10}>{ret}</Flex>);
};
DisplayFormControl.propTypes = {
  content: PropTypes.array,
  teammateIndex: PropTypes.number,
  eidolon: PropTypes.number, // TODO: Is this needed?
  ultBoostMax: PropTypes.number, // TODO: Is this needed?
};

export default DisplayFormControl;