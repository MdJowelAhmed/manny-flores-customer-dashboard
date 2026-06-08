import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

const FILTER_OPTIONS = ['all', 'completed', 'pending', 'rejected'] as const

interface PaymentStatusFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function PaymentStatusFilters({
  activeFilter,
  onFilterChange,
}: PaymentStatusFiltersProps) {
  const { t } = useTranslation()

  const getLabel = (value: string) => {
    if (value === 'all') return t('payment.all')
    if (value === 'completed') return t('payment.completed', { defaultValue: 'Completed' })
    if (value === 'pending') return t('payment.pending')
    if (value === 'rejected') return t('payment.rejected', { defaultValue: 'Rejected' })
    return value
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors border',
            activeFilter === filter
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          )}
        >
          {getLabel(filter)}
        </button>
      ))}
    </div>
  )
}
