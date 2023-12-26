import {Flex} from "antd";
import {HeaderText} from "../components/HeaderText";
import React from "react";

function precisionRound(number, precision = 8) {
  let factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

const lightConeOptionMapping = {

}

export const LightConeConditionals = {
  get: (request) => {
    let lcFn = lightConeOptionMapping[request.lightConeId]
    return lcFn(request.lightConeSuperimposition)
  },
  getDisplayForLightCone: (id, superimposition) => {
    console.warn('getDisplayForLightCone', id)
    if (!id) {
      return (
        <Flex vertical gap={10}>
          <HeaderText>Light cone passives</HeaderText>
        </Flex>
      )
    }

    let lcFn = lightConeOptionMapping[id]
    let display = lcFn(superimposition).display()

    return (
      <Flex vertical gap={10}>
        <HeaderText>Light cone passives</HeaderText>
        {display}
      </Flex>
    )
  },
}