import React, { useMemo, useState } from 'react'
import { Flex } from 'antd'
import { AppPages } from 'lib/db.js'
import { getDevice } from 'lib/gpu/webgpuInternals'

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

  getDevice().then((x) => {
    setData(x?.limits.maxComputeWorkgroupsPerDimension || 'WebGPU not supported')
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
      {data}
    </Flex>
  )
}
