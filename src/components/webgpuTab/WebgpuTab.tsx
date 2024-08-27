import React, { useMemo, useState } from 'react'
import { Flex } from 'antd'
import { AppPages } from 'lib/db.js'
import { getDevice } from 'lib/gpu/webgpuInternals'
import { runTests } from 'lib/gpu/tests/webgpuTester'

export default function WebgpuTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)
  const [data, setData] = useState<string>('')
  const result = useMemo(async () => {
    const device = await getDevice()
    return device!
  }, [])

  if (activeKey != AppPages.WEBGPU_TEST) {
    // Don't load unless active
    return (<></>)
  }

  getDevice().then(async (device) => {
    if (!device) {
      return setData('WebGPU not supported')
    }

    const x = await runTests(device)

    console.log('!!!', x)

    setData(JSON.stringify(x, null, 2))
  })
  //
  // const request = getDefaultForm({
  //   id: '1212',
  // }) as Form
  // const params = generateParams(request)
  // const relics = generateTestRelics()
  // const relicSetSolutions = new Array<number>(Math.pow(Object.keys(SetsRelics).length, 4)).fill(1)
  // const ornamentSetSolutions = new Array<number>(Math.pow(Object.keys(SetsOrnaments).length, 2)).fill(1)
  // const permutations = 1
  //
  // const results = await executeGpuTest(
  //   page,
  //   relics,
  //   request,
  //   params,
  //   permutations,
  //   relicSetSolutions,
  //   ornamentSetSolutions,
  // )

  return (
    <Flex>
      <pre>
        {data}
      </pre>
    </Flex>
  )
}
