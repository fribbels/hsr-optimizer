import React from "react";
import { Flex } from "antd";
import { Assets } from "lib/assets";
import { Constants } from "lib/constants";

const GenerateSetsOptions = () => {
  const result = [
    // Example: aaaa
    {
      value: '4 Piece',
      label: '4 Piece',
      children: []
    },
    // Example: aabb
    {
      value: '2 + 2 Piece',
      label: '2 + 2 Piece',
      children: []
    },
    // Example: aabc
    {
      value: '2 + Any',
      label: '2 + Any',
      children: []
    }
  ];

  const tier2Children = Object.entries(Constants.SetsRelics).map(set => ({ value: set[1], label: set[1] }));

  const GenerateLabel = (value: string, parens: string, label: string): JSX.Element => {
    const imageSrc = value == 'Any' ? Assets.getBlank() : Assets.getSetImage(value, Constants.Parts.Head);
    return (
      <Flex gap={5} align='center'>
        <img src={imageSrc} style={{ width: 26, height: 26 }}></img>
        <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
          {parens + label}
        </div>
      </Flex>
    )
  }

  for (const set of Object.entries(Constants.SetsRelics)) {
    result[0].children.push({
      value: set[1],
      label: GenerateLabel(set[1], '(4) ', set[1])
    })

    result[1].children.push({
      value: set[1],
      label: GenerateLabel(set[1], '(2) ', set[1]),
      children: tier2Children.map(x => {
        const parens = x.value == 'Any' ? '(0) ' : '(2) ';
        return {
          value: x.value,
          label: GenerateLabel(x.value, parens, x.label)
        }
      })
    })

    result[2].children.push({
      value: set[1],
      label: GenerateLabel(set[1], '(2) ', set[1])
    })
  }

  return result;
};

export default GenerateSetsOptions;

