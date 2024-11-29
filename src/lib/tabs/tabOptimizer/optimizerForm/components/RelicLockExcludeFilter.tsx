import { Button, Divider, Flex } from 'antd'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { ReactElement, useEffect, useState } from 'react'

export function RelicLockExcludeFilter() {
  const options = ['Head', 'Hands', 'Body', 'Feet', 'Sphere', 'Rope']
  return (
    <Flex vertical gap={optimizerTabDefaultGap} justify='space-between' align='center'>
      <Flex justify='space-between' align='center' style={{ width: '100%' }}>
        <HeaderText>Relic lock / exclude</HeaderText>
      </Flex>
      <CustomSegmented
        onChange={() => { return }}
        options={options}
        rows={2}
        id='RelicExcludePartSelectSegmented'
      />
      <Flex gap={16} justify='center' style={{ width: '100%' }}>
        <Button>Reserve</Button>
        <Button>Exclude</Button>
      </Flex>
      <Divider style={{ margin: 10 }}/>
      <Button style={{ width: '100%' }}>View excluded relics (0)</Button>
      <Button style={{ width: '100%' }}>View reserved relics (0)</Button>
    </Flex>
  )
}

function CustomSegmented(props: CustomSegmentedProps) {
  return (
    <div id={props.id} style={{ width: '100%' }}>
      <CustomSegmentedContent {...props}/>
    </div>
  )
}

function CustomSegmentedContent(props: CustomSegmentedProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  useEffect(() => props.onChange(selectedIndex), [selectedIndex, props])
  const colour = props.colour ?? '#1c263d'
  const hoverColour = props.hoverColour ?? '#343d51'
  const selectedColour = props.selectedColour ?? '#2a3c64'
  const clickedColour = props.clickedColour ?? '#424a5d'
  const backgroundColour = props.backgroundColor ?? '#2a3c64'
  const rowCells: ReactElement[][] = []
  const parentWidth = document.getElementById(props.id)?.getBoundingClientRect().width
  const cellHeight = props.rowHeight ?? 30
  const cellWidth = parentWidth ? Math.floor(parentWidth * props.rows / props.options.length) : 70
  const borderRadius = props.borderRadius ?? 6
  let index = 0
  for (const label of props.options) {
    if (!rowCells[Math.floor(index / props.rows)]) {
      rowCells[Math.floor(index / props.rows)] = []
    }
    rowCells[Math.floor(index / props.rows)].push(
      <CustomSegmentedElement
        key={index}
        handleClick={setSelectedIndex}
        index={index}
        selectedIndex={selectedIndex}
        Colour={colour}
        hoverColour={hoverColour}
        selectedColour={selectedColour}
        clickedColour={clickedColour}
        text={label}
        borderRadius={borderRadius}
        width={cellWidth}
        height={cellHeight}
      />,
    )
    index++
  }
  const rows: ReactElement[] = []
  rowCells.forEach((row, index) => {
    rows.push(
      <Flex key={index} vertical style={{ width: cellWidth }}>
        {row}
      </Flex>,
    )
  })
  return (
    <div style={{ width: cellWidth * props.options.length / props.rows, height: props.rows * cellHeight }}>
      <Flex
        justify='space-between'
        align='center'
        style={{
          backgroundColor: colour,
          width: '100%',
          position: 'relative',
          borderRadius: borderRadius,
        }}
      >
        {rows}
      </Flex>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          left: 0,
          bottom: props.rows * cellHeight,
          width: cellWidth, // weird size behaviour
          height: cellHeight,
          backgroundColor: backgroundColour,
          borderRadius: borderRadius,
          zIndex: 2,
          transition: 'transform 0.4s ease',
          transform: `
          translateX(${Math.floor(selectedIndex / props.rows) * cellWidth}px)
          translateY(${(selectedIndex % props.rows) * cellHeight}px)
          `,
        }}
      >
      </div>
    </div>
  )
}

interface CustomSegmentedProps {
  id: string
  onChange: (index: number) => void
  options: (string | number | ReactElement)[]
  rows: number
  rowHeight?: number
  colour?: string
  hoverColour?: string
  selectedColour?: string
  clickedColour?: string
  backgroundColor?: string
  borderRadius?: number
}

function CustomSegmentedElement(props: CustomSegmentedElementProps) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const elementWidth = props.width
  const elementHeight = props.height
  const borderRadius = props.borderRadius
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
        }}
      >
        {props.text}
      </Flex>
      <div
        style={{
          display: 'flex',
          width: elementWidth,
          zIndex: 1,
          borderRadius: borderRadius,
          height: elementHeight,
          bottom: elementHeight,
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

interface CustomSegmentedElementProps {
  handleClick: (index: number) => void
  index: number
  selectedIndex: number
  Colour: string
  hoverColour: string
  selectedColour: string
  clickedColour: string
  width: number
  height: number
  text: string | number | ReactElement
  borderRadius: number
}
