import i18n from '@/i18n/i18n'
import { toast } from '@/utils/toast'

function isRtkQueryError(reason: unknown): boolean {
  return (
    typeof reason === 'object' &&
    reason !== null &&
    ('status' in reason || 'data' in reason)
  )
}

export function setupGlobalErrorHandlers() {
  window.addEventListener('unhandledrejection', (event) => {
    if (isRtkQueryError(event.reason)) return

    console.error('Unhandled promise rejection:', event.reason)

    toast({
      variant: 'destructive',
      title: i18n.t('errors.unexpectedError'),
      description: i18n.t('errors.anErrorOccurred'),
    })
  })

  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error ?? event.message)
  })
}
