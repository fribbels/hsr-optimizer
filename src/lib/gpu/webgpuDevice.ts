import { COMPUTE_ENGINE_CPU } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { webgpuNotSupportedNotification } from 'lib/interactions/notifications'

export async function getWebgpuDevice(notify?: boolean) {
  try {
    const adapter: GPUAdapter | null = await navigator?.gpu?.requestAdapter()

    if (adapter == null) {
      throw new Error()
    }

    return await adapter.requestDevice({
      requiredLimits: {
        // Investigate limits for high-end experimental channel
        // maxComputeInvocationsPerWorkgroup: 512,
        // maxComputeWorkgroupSizeX: 512,
        // maxStorageBufferBindingSize: 268435456,
      },
    })
  } catch (e) {
    if (notify) {
      console.error('Webgpu not supported', e)
      webgpuNotSupportedNotification()
    }
  }
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
