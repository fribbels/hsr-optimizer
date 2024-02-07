import { Button, Divider, Flex, Progress, Typography } from "antd";
import React from 'react';
import FormCard from "./FormCard";
import { HeaderText } from "../HeaderText";
import { TooltipImage } from "../TooltipImage";
import { OptimizerTabController } from "../../lib/optimizerTabController";
import { Hint } from "../../lib/hint";
import PropTypes from "prop-types";

const { Text } = Typography;

function PermutationDisplay(props) {
  let rightText = props.total
    ? `${Number(props.right).toLocaleString()} / ${Number(props.total).toLocaleString()} - (${Math.ceil(Number(props.right) / Number(props.total) * 100)}%)`
    : `${Number(props.right).toLocaleString()}`

  return (
    <Flex justify='space-between'>
      <Text style={{ lineHeight: '24px' }}>
        {props.left}
      </Text>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
      <Text style={{ lineHeight: '24px' }}>
        {rightText}
      </Text>
    </Flex>
  )
}
PermutationDisplay.propTypes = {
  total: PropTypes.number,
  right: PropTypes.number,
  left: PropTypes.string
}


let defaultGap = 5

export default function Sidebar() {

  const permutationDetails = window.store(s => s.permutationDetails)
  const permutations = window.store(s => s.permutations)
  const permutationsSearched = window.store(s => s.permutationsSearched)
  const permutationsResults = window.store(s => s.permutationsResults)

  return (
    <Flex vertical style={{overflow: 'clip'}}>
      <Flex style={{position: 'sticky', top: '50%', transform: 'translateY(-50%)', paddingLeft: 10}}>
        <FormCard height={525}>
          <Flex vertical gap={10}>
            <Flex justify='space-between' align='center'>
              <HeaderText>Permutations</HeaderText>
              <TooltipImage type={Hint.optimizationDetails()} />
            </Flex>

            <Flex vertical>
              <PermutationDisplay left='Head' right={permutationDetails.Head} total={permutationDetails.HeadTotal} />
              <PermutationDisplay left='Hands' right={permutationDetails.Hands} total={permutationDetails.HandsTotal} />
              <PermutationDisplay left='Body' right={permutationDetails.Body} total={permutationDetails.BodyTotal} />
              <PermutationDisplay left='Feet' right={permutationDetails.Feet} total={permutationDetails.FeetTotal} />
              <PermutationDisplay left='Rope' right={permutationDetails.LinkRope} total={permutationDetails.LinkRopeTotal} />
              <PermutationDisplay left='Sphere' right={permutationDetails.PlanarSphere} total={permutationDetails.PlanarSphereTotal} />
            </Flex>

            <Flex vertical>
              <PermutationDisplay left='Perms' right={permutations} />
              <PermutationDisplay left='Searched' right={permutationsSearched} />
              <PermutationDisplay left='Results' right={permutationsResults} />
            </Flex>

            <Flex vertical>
              <HeaderText>Progress</HeaderText>
              <Progress
                strokeColor={'#1668DC'}
                steps={17}
                size={[8, 5]}
                percent={Math.floor(Number(permutationsSearched) / Number(permutations) * 100)}
              />
            </Flex>

            <Flex justify='space-between' align='center' >
              <HeaderText>Controls</HeaderText>
            </Flex>

            <Flex gap={defaultGap} style={{ marginBottom: 2 }} vertical>
              <Flex gap={defaultGap}>
                <Button type="primary" onClick={window.optimizerStartClicked} style={{ width: '205px' }} >
                  Start
                </Button>
              </Flex>
              <Flex gap={defaultGap}>
                <Button onClick={window.optimizerCancelClicked} style={{ width: '100px' }} >
                  Cancel
                </Button>
                <Button onClick={window.optimizerResetClicked} style={{ width: '100px' }} >
                  Reset
                </Button>
              </Flex>
              <Flex gap={defaultGap}>
              </Flex>
            </Flex>

            <Flex justify='space-between' align='center'>
              <HeaderText>Results</HeaderText>
              <TooltipImage type={Hint.actions()} />
            </Flex>
            <Flex gap={defaultGap} justify='space-around'>
              <Button onClick={window.optimizerFilterClicked} style={{ width: '100px' }} >
                Filter
              </Button>
              <Button onClick={OptimizerTabController.equipClicked} style={{ width: '100px' }} >
                Equip
              </Button>
            </Flex>
          </Flex>
        </FormCard>
      </Flex>
    </Flex>
  )
}