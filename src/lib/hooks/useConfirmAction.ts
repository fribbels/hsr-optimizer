import { modals } from '@mantine/modals'
import { type ReactNode, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export function useConfirmAction() {
  const { t } = useTranslation('common')

  return useCallback((content: ReactNode) => {
    return new Promise<boolean>((resolve) => {
      modals.openConfirmModal({
        title: t('Confirm'),
        children: content,
        labels: { confirm: t('Confirm'), cancel: t('Cancel') },
        centered: true,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
  }, [t])
}
