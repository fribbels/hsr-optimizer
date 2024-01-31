import React from 'react';

// Colorizes numbers in a string with JSX elements
const ColorizeNumbers = (text: string, color: string = '#ebb434') => {
  const ret = [];
  let num = '';
  let isNum = false;

  if (text) {
    // split text by "::BR::" and replace with <br />
    // text.split('::BR::').map((item, i) => {
    //   ret.push <React.Fragment key={i}>{item}<br /></React.Fragment>;
    // });
    text.split('::BR::').forEach((item, i) => {
      if (ret.length > 0) {
        ret.push(<br key={i} />);
        ret.push(<br key={i} />);
      }

      for (let i = 0; i < item.length; i++) {
        if (
          (item[i] >= '0' && item[i] <= '9')
            || item[i] === '%'
            || (item[i] === 'A' && item[i + 1] && /[2,4,6]/.test(item[i + 1]))
            || (item[i] === 'E' && item[i + 1] && /[0-6]/.test(item[i + 1]))
          ) {
          num += item[i];
          isNum = true;
        } else {
          if (isNum) {
            ret.push(<span key={i} style={{ color: color }}>{num}</span>);
            num = '';
            isNum = false;
          }
          ret.push(item[i]);
        }
      }
    
      if (isNum) {
        ret.push(<span key={-1} style={{ color: color }}>{num}</span>);
      }
    });

  }

  return <>{ret}</>;
};

export default ColorizeNumbers;