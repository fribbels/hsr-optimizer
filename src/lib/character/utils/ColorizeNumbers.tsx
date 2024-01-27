import React from 'react';

// Colorizes numbers in a string with JSX elements
const ColorizeNumbers = (text: string, color: string = '#ebb434') => {
  const ret = [];
  let num = '';
  let isNum = false;

  if (text) {
    for (let i = 0; i < text.length; i++) {
      if ((text[i] >= '0' && text[i] <= '9') || text[i] === '%') {
        num += text[i];
        isNum = true;
      } else {
        if (isNum) {
          ret.push(<span style={{ color: color }}>{num}</span>);
          num = '';
          isNum = false;
        }
        ret.push(text[i]);
      }
    }
  
    if (isNum) {
      ret.push(<span style={{ color: color }}>{num}</span>);
    }
  }

  return <>{ret}</>;
};

export default ColorizeNumbers;