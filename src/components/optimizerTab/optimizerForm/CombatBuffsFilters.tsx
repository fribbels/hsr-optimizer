import { Flex, Form, Typography } from 'antd'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import InputNumberStyled from 'components/optimizerTab/optimizerForm/InputNumberStyled.tsx'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants.ts'

const { Text } = Typography

export const CombatBuffsFilters = () => {
  return (

    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify="space-between" align="center">
        <HeaderText>Combat buffs</HeaderText>
        <TooltipImage type={Hint.combatBuffs()} />
      </Flex>

      <Flex vertical gap={optimizerTabDefaultGap}>
        <Flex justify="space-between">
          <Text>
            ATK
          </Text>
          <Form.Item name="buffAtk">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            ATK %
          </Text>
          <Form.Item name="buffAtkP">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            Crit Rate %
          </Text>
          <Form.Item name="buffCr">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            Crit Dmg %
          </Text>
          <Form.Item name="buffCd">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            SPD
          </Text>
          <Form.Item name="buffSpd">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            SPD %
          </Text>
          <Form.Item name="buffSpdP">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            BE %
          </Text>
          <Form.Item name="buffBe">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            Dmg Boost %
          </Text>
          <Form.Item name="buffDmgBoost">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            Def Shred %
          </Text>
          <Form.Item name="buffDefShred">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>

        <Flex justify="space-between">
          <Text>
            RES Pen %
          </Text>
          <Form.Item name="buffResPen">
            <InputNumberStyled size="small" controls={false} />
          </Form.Item>
        </Flex>
      </Flex>
    </Flex>
  )
}
