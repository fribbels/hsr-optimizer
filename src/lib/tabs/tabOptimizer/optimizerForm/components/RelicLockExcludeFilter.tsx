import { Flex, Segmented } from 'antd'
import { Hint } from 'lib/interactions/hint'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { CSSProperties, Dispatch, SetStateAction, useEffect, useState, useTransition } from 'react'

export function RelicLockExcludeFilter() {
  return (
    <Flex vertical gap={optimizerTabDefaultGap} justify='space-between' align='center'>
      <Flex justify='space-between' align='center' style={{ width: '100%' }}>
        <HeaderText>Relic lock / exclude</HeaderText>
        <TooltipImage type={Hint.statFilters()}/>
      </Flex>
      <Segmented
        block
        options={['Reserve', 'Exclude']}
        style={{ width: '100%' }}
      />
      Selected
      <CustomSegmented onChange={() => { return }}/>
    </Flex>
  )
}

function CustomSegmented(props: { onChange: (index: number) => void }) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  useEffect(() => props.onChange(selectedIndex), [selectedIndex, props])
  const colour = '#1c263d'
  const hoverColour = '#343d51'
  const selectedColour = '#2a3c64'
  const clickedColour = '#424a5d'
  return (
    <div style={{ width: '100%' }}>
      <Flex
        justify='space-between'
        align='center'
        style={{
          backgroundColor: '#1c263d',
          width: '100%',
          position: 'relative',
          borderRadius: 6,
        }}
        onMouseEnter={() => { return }}
      >
        <Flex vertical style={{ width: 70 }}>
          <CustomSegmentedElement
            handleClick={setSelectedIndex}
            index={0}
            selectedIndex={selectedIndex}
            Colour={colour}
            hoverColour={hoverColour}
            selectedColour={selectedColour}
            clickedColour={clickedColour}
            text='Head'
          />
          <CustomSegmentedElement
            handleClick={setSelectedIndex}
            index={1}
            selectedIndex={selectedIndex}
            Colour={colour}
            hoverColour={hoverColour}
            selectedColour={selectedColour}
            clickedColour={clickedColour}
            text='Hands'
          />
        </Flex>
        <Flex vertical style={{ width: 70 }}>
          <CustomSegmentedElement
            handleClick={setSelectedIndex}
            index={2}
            selectedIndex={selectedIndex}
            Colour={colour}
            hoverColour={hoverColour}
            selectedColour={selectedColour}
            clickedColour={clickedColour}
            text='Body'
          />
          <CustomSegmentedElement
            handleClick={setSelectedIndex}
            index={3}
            selectedIndex={selectedIndex}
            Colour={colour}
            hoverColour={hoverColour}
            selectedColour={selectedColour}
            clickedColour={clickedColour}
            text='Feet'
          />
        </Flex>
        <Flex vertical style={{ width: 70 }}>
          <CustomSegmentedElement
            handleClick={setSelectedIndex}
            index={4}
            selectedIndex={selectedIndex}
            Colour={colour}
            hoverColour={hoverColour}
            selectedColour={selectedColour}
            clickedColour={clickedColour}
            text='Sphere'
          />
          <CustomSegmentedElement
            handleClick={setSelectedIndex}
            index={5}
            selectedIndex={selectedIndex}
            Colour={colour}
            hoverColour={hoverColour}
            selectedColour={selectedColour}
            clickedColour={clickedColour}
            text='Rope'
          />
        </Flex>
      </Flex>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          left: 0,
          bottom: 60,
          width: 71, // weird size behaviour
          height: 30,
          backgroundColor: '#2a3c64',
          borderRadius: 6,
          zIndex: 200,
          transition: 'transform 0.4s ease',
          transform: `translateX(${Math.floor(selectedIndex / 2) * 70}px) translateY(${(selectedIndex % 2) * 30}px)`,
        }}
      >
      </div>
    </div>
  )
}

function CustomSegmentedElement(props: CustomSegmentedElementProps) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  return (
    <div style={{ width: 70, height: 30 }}>
      <Flex
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false)
          setClicked(false)
        }}
        onMouseDown={() => setClicked(true)}
        onMouseUp={() => setClicked(false)}
        onClick={() => props.handleClick(props.index)}
        style={{
          width: 70,
          height: 30,
          zIndex: 300,
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: 'transparent',
        }}
      >
        {props.text}
      </Flex>
      <div
        style={{
          display: 'flex',
          width: 70,
          zIndex: 100,
          borderRadius: 6,
          height: 30,
          bottom: 30,
          position: 'relative',
          backgroundColor: clicked
            ? props.clickedColour
            : hovered
              ? props.hoverColour
              : props.Colour,
        }}
      >
      </div>
    </div>
  )
}

type CustomSegmentedElementProps = {
  handleClick: Dispatch<SetStateAction<number>>
  index: number
  selectedIndex: number
  Colour: string
  hoverColour: string
  selectedColour: string
  clickedColour: string
  style?: CSSProperties
  text: string
}
