import { Card, Flex, Input } from 'antd'
import { AppPages } from 'lib/db.js'
import React from 'react'

const headerHeight = 900
const headerWidth = 1600

export default function LandingTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.LANDING) {
    // Don't load unless tab active
    return (<></>)
  }

  return (
    <Flex
      vertical
      style={{ width: '100%', position: 'relative' }}
      align='center'
    >
      <HeaderImage/>
      <Header/>
      <InfoContent/>

    </Flex>
  )
}

function HeaderImage() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        maxWidth: headerWidth,
        height: headerHeight,
        maxHeight: headerHeight,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat', // Prevents repeating
        backgroundImage: `
            linear-gradient(to top, rgba(24, 34, 57, 0) 99%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to bottom, rgba(24, 34, 57, 0) 99%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to left, rgba(24, 34, 57, 0) 97%, rgba(24, 34, 57, 1) 99%),
            linear-gradient(to right, rgba(24, 34, 57, 0) 97%, rgba(24, 34, 57, 1) 99%),
            url(https://i.imgur.com/GfIaokt.jpeg)
          `,
        backgroundSize: 'cover',
      }}
    />
  )
}

const cardGap = 20
const cardToSrc: Record<string, string> = {
  test1: 'http://localhost:3000/hsr-optimizer/assets/misc/landing/test1.png',
  test2: 'http://localhost:3000/hsr-optimizer/assets/misc/landing/test2.png',
  test3: 'http://localhost:3000/hsr-optimizer/assets/misc/landing/test3.png',
  test4: 'http://localhost:3000/hsr-optimizer/assets/misc/landing/test4.png',
}

function CardImage(props: { id: string }) {
  return (
    <div style={{ padding: '15px 15px 0px 15px' }}>
      <img
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 8,
          outline: 'rgba(255, 255, 255, 0.15) solid 1px',
          boxShadow: 'rgb(0 0 0 / 50%) 2px 2px 3px',
        }}
        src={cardToSrc[props.id]}
      />
    </div>
  )
}

function FeatureCard(props: { title: string; id: string; content: string }) {
  return (
    <Card
      title={props.title}
      style={{
        flex: 1,
        cursor: 'default',
      }}
      hoverable={true}
      cover={<CardImage id={props.id}/>}
    >
      {props.content}
    </Card>
  )
}

function InfoContent() {
  return (
    <Flex style={{ maxWidth: headerWidth, minWidth: 1000, width: '100%', padding: 20 }}>
      <Flex vertical style={{ width: '100%' }} gap={cardGap}>
        <Flex gap={cardGap}>
          <FeatureCard
            title='Character Showcase'
            id='test1'
            content='Card content'
          />
          <FeatureCard
            title='Relic Optimizer'
            id='test2'
            content='Card content'
          />
        </Flex>
        <Flex gap={cardGap} style={{ width: '100%' }}>
          <FeatureCard
            title='Damage Calculator'
            id='test3'
            content='Card content'
          />
          <FeatureCard
            title='Relic Organizer'
            id='test4'
            content='Card content'
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

function Header() {
  return (
    <Flex
      vertical
      style={{
        width: '100%',
        zIndex: 1,
        height: headerHeight,
      }}
      align='center'
    >
      <h1
        style={{
          marginTop: 40,
          fontSize: 60,
          color: 'white', // Ensure the text color is white
          textShadow: '#000000 2px 2px 20px', // Add a dark shadow for better contrast
          textAlign: 'center', // Center-align the text
          fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
        }}
      >
        Welcome to the<br/>Star Rail Optimizer
      </h1>
      <div style={{ height: 480 }}/>
      <Flex
        vertical
        className='landingCard'
        style={{ width: 700, height: 115, padding: 20 }}
        align='center'
        justify='center'
        gap={5}
      >
        <Flex justify='flex-start' style={{ width: '100%', marginLeft: 5, fontSize: 18, textShadow: '#000000 2px 2px 12px' }}>
          Enter your UUID to showcase your characters:
        </Flex>
        <Input.Search
          placeholder='UUID'
          allowClear
          enterButton='Search'
          size='large'
          style={{}}
          onSearch={() => {
          }}
        />
      </Flex>
    </Flex>
  )
}
