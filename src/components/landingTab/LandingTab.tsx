import React from 'react'
import { AppPages } from 'lib/db.js'
import { Flex, Input } from 'antd'

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
      align="center"
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          width: '100%',
          maxWidth: 1600,
          height: 900,
          maxHeight: 900,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat', // Prevents repeating
          backgroundImage: `
            linear-gradient(to top, rgba(24, 34, 57, 0) 99%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to bottom, rgba(24, 34, 57, 0) 99%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to left, rgba(24, 34, 57, 0) 90%, rgba(24, 34, 57, 1) 99%),
            linear-gradient(to right, rgba(24, 34, 57, 0) 90%, rgba(24, 34, 57, 1) 99%),
            url(https://i.imgur.com/GfIaokt.jpeg)
          `,
          backgroundSize: 'cover',
        }}
      />

      <Flex
        vertical
        style={{
          width: '100%',
          zIndex: 1
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
          className="landingCard"
          style={{ width: 700, height: 115, padding: 20 }}
          align='center'
          justify='center'
          gap={5}
        >
          <Flex justify='flex-start' style={{ width: '100%', marginLeft: 5, fontSize: 18, textShadow: '#000000 2px 2px 12px' }}>
            Enter your UUID to showcase your characters:
          </Flex>
          <Input.Search
            placeholder="UUID"
            allowClear
            enterButton="Search"
            size="large"
            style={{}}
            onSearch={() => {
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

