import { SavedSessionKeys } from 'lib/constantsSession'
import { COMPUTE_ENGINE_CPU } from 'lib/constants'
import { webgpuNotSupportedNotification } from 'lib/notifications'

export async function getWebgpuDevice(warn?: boolean) {
  const adapter: GPUAdapter | null = await navigator?.gpu?.requestAdapter()

  if (adapter == null) {
    console.log('Webgpu not supported')

    if (warn) {
      webgpuNotSupportedNotification()
    }

    return null
  }
  return await adapter.requestDevice({
    requiredLimits: {
      // Investigate limits for high-end experimental channel
      // maxComputeInvocationsPerWorkgroup: 512,
      // maxComputeWorkgroupSizeX: 512,
      // maxStorageBufferBindingSize: 268435456,
    },
  })
}

export async function verifyWebgpuSupport(warn: boolean) {
  try {
    const device = await getWebgpuDevice(warn)
    if (!device) {
      window.store.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
    }

    return device
  } catch (e) {
    console.log(e)
    return null
  }
}
