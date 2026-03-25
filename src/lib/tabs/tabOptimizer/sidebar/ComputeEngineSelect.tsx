import { IconChevronDown } from '@tabler/icons-react'
import { Button, Flex, Menu } from '@mantine/core'
import i18next from 'i18next'
import {
  COMPUTE_ENGINE_CPU,
  COMPUTE_ENGINE_GPU_EXPERIMENTAL,
  COMPUTE_ENGINE_GPU_STABLE,
  type ComputeEngine,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { verifyWebgpuSupport } from 'lib/gpu/webgpuDevice'
import { Message } from 'lib/interactions/message'
import { SaveState } from 'lib/state/saveState'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalStore } from 'lib/stores/app/appStore'

type GpuOption = { label: ReactElement, key: ComputeEngine }

function getGpuOptions(computeEngine: ComputeEngine): GpuOption[] {
  return [
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine === COMPUTE_ENGINE_GPU_EXPERIMENTAL ? 'bold' : '' }}>
          {i18next.t('optimizerTab:Sidebar.GPUOptions.Experimental')}
          {/* GPU acceleration enabled (experimental) */}
        </div>
      ),
      key: COMPUTE_ENGINE_GPU_EXPERIMENTAL,
    },
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine === COMPUTE_ENGINE_GPU_STABLE ? 'bold' : '' }}>
          {i18next.t('optimizerTab:Sidebar.GPUOptions.Stable')}
          {/* GPU acceleration enabled (stable) */}
        </div>
      ),
      key: COMPUTE_ENGINE_GPU_STABLE,
    },
    {
      label: (
        <div style={{ width: '100%', fontWeight: computeEngine === COMPUTE_ENGINE_CPU ? 'bold' : '' }}>
          {i18next.t('optimizerTab:Sidebar.GPUOptions.CPU')}
          {/* CPU only */}
        </div>
      ),
      key: COMPUTE_ENGINE_CPU,
    },
  ]
}

export function ComputeEngineSelect() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.GPUOptions' })
  const computeEngine = useGlobalStore((s) => s.savedSession[SavedSessionKeys.computeEngine])
  const handleGpuOptionClick = (key: GpuOption['key']) => {
    if (key === COMPUTE_ENGINE_CPU) {
      useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
      Message.success(t('EngineSwitchSuccessMsg.CPU') /* Switched compute engine to CPU */)
      SaveState.delayedSave()
    } else {
      void verifyWebgpuSupport(true).then((device) => {
        if (device) {
          useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, key)
          Message.success(key === COMPUTE_ENGINE_GPU_EXPERIMENTAL ? t('EngineSwitchSuccessMsg.Experimental') : t('EngineSwitchSuccessMsg.Stable'))
          SaveState.delayedSave()
        }
      })
    }
  }

  return (
    <Menu position='bottom-end'>
      <Menu.Target>
        <Button variant="default" className='custom-dropdown-button' style={{ padding: 3 }}>
          <Flex justify='space-around' align='center' w='100%'>
            <div style={{ width: 1 }} />
            <div>
              {
                t(`Display.${computeEngine}`)
                /*
                  [COMPUTE_ENGINE_GPU_EXPERIMENTAL]: 'GPU acceleration: Enabled',
                  [COMPUTE_ENGINE_GPU_STABLE]: 'GPU acceleration: Enabled',
                  [COMPUTE_ENGINE_CPU]: 'GPU acceleration: Disabled',
                */
              }
            </div>
            <IconChevronDown size={16} style={{ marginLeft: 2 }} />
          </Flex>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {getGpuOptions(computeEngine).map((option) => (
          <Menu.Item key={option.key} onClick={() => handleGpuOptionClick(option.key)}>
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
