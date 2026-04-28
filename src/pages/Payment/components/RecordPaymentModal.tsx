import { useTranslation } from 'react-i18next'
import { FolderKanban } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { STATUS_COLORS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { Payment } from '../paymentsData'

interface RecordPaymentModalProps {
  open: boolean
  onClose: () => void
  payment: Payment | null
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between items-center py-2 gap-4">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className={cn('text-sm font-medium text-right', valueClassName)}>
        {value}
      </span>
    </div>
  )
}

export function RecordPaymentModal({
  open,
  onClose,
  payment,
}: RecordPaymentModalProps) {
  const { t } = useTranslation()

  if (!payment) return null

  const statusConfig = STATUS_COLORS[payment.status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('payment.recordPaymentTitle')}
      size="md"
      className="max-w-lg bg-white"
    >
      <div className="space-y-6">
        <div>
          <DetailRow label={t('payment.invoiceNumber')} value={payment.invoice} />
          <DetailRow label={t('payment.customerName')} value={payment.customer} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-full bg-green-100">
              <FolderKanban className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('payment.projectInfo')}
            </h3>
          </div>
          <div className="space-y-0 pl-8">
            <DetailRow label={t('payment.projectName')} value={payment.project} />
            <DetailRow label={t('payment.paymentMethod')} value={payment.method} />
            <DetailRow
              label={t('payment.totalAmount')}
              value={formatCurrency(payment.totalAmount, 'USD')}
              valueClassName="text-green-600"
            />
            <DetailRow
              label={t('payment.amountDue')}
              value={formatCurrency(payment.outstandingAmount, 'USD')}
              valueClassName="text-red-600"
            />
            <DetailRow
              label={t('payment.paymentAmount')}
              value={formatCurrency(payment.paidAmount, 'USD')}
              valueClassName="text-green-600"
            />
            {payment.paymentDate && (
              <DetailRow
                label={t('payment.paymentDate')}
                value={payment.paymentDate}
              />
            )}
            {payment.note ? (
              <DetailRow label={t('payment.note')} value={payment.note} />
            ) : null}
            <DetailRow
              label={t('payment.status')}
              value={payment.status}
              valueClassName={cn(statusConfig.text, 'font-medium')}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
