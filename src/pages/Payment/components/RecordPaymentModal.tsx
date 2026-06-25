import { useTranslation } from 'react-i18next'
import { FolderKanban } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { imageUrl } from '@/components/common/getImageUrl'
import { STATUS_COLORS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { formatPaymentStatusLabel, type Payment } from '../paymentsData'

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
    <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-gray-100 last:border-0 gap-4">
      <span className="text-[13px] text-muted-foreground flex-shrink-0">{label}</span>
      <span className={cn('text-[13px] font-medium text-right', valueClassName)}>{value}</span>
    </div>
  )
}

export function RecordPaymentModal({ open, onClose, payment }: RecordPaymentModalProps) {
  const { t } = useTranslation()

  if (!payment) return null

  const statusLabel = formatPaymentStatusLabel(payment.status)
  const statusConfig = STATUS_COLORS[statusLabel] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('payment.recordPaymentTitle')}
      size="md"
      className="max-w-2xl bg-white sm:rounded-2xl"
      headerClassName="border-b border-gray-100 pb-4"
    >
      <div className="flex flex-col gap-4">

        {/* Invoice + Customer summary bar */}
        <div className="flex justify-between items-center px-3.5 py-2.5 bg-gray-50 rounded-xl">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">
              {t('payment.invoiceNumber')}
            </p>
            <p className="text-sm font-medium text-gray-900">{payment.invoice}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">
              {t('payment.customerName')}
            </p>
            <p className="text-sm font-medium text-gray-900">{payment.customer}</p>
          </div>
        </div>

        {/* Project info card */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">

          {/* Card header */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-green-100 flex-shrink-0">
              <FolderKanban className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="text-[13px] font-medium text-gray-900">
              {t('payment.projectInfo')}
            </span>
          </div>

          {/* Rows */}
          <div>
            <DetailRow label={t('payment.projectName')} value={payment.project} />
            <DetailRow label={t('payment.paymentMethod')} value={payment.method} />
            {payment.totalCost != null && payment.totalCost > 0 && (
              <DetailRow
                label={t('payment.totalAmount')}
                value={formatCurrency(payment.totalCost, 'USD')}
              />
            )}
            <DetailRow
              label={t('payment.paymentAmount')}
              value={payment.amount != null ? formatCurrency(payment.amount, 'USD') : '—'}
              valueClassName="text-green-600"
            />
            {payment.paymentDate && (
              <DetailRow label={t('payment.paymentDate')} value={payment.paymentDate} />
            )}
            {payment.trxId && (
              <DetailRow
                label={t('payment.transactionId', { defaultValue: 'Transaction ID' })}
                value={payment.trxId}
                valueClassName="font-mono"
              />
            )}
            {payment.note && (
              <DetailRow label={t('payment.note')} value={payment.note} />
            )}

            {/* Status row — pill badge instead of plain text */}
            <div className="flex justify-between items-center px-3.5 py-2.5 gap-4">
              <span className="text-[13px] text-muted-foreground flex-shrink-0">
                {t('payment.status')}
              </span>
              <span
                className={cn(
                  'text-[11px] font-medium px-2.5 py-0.5 rounded-full',
                  statusConfig.bg,
                  statusConfig.text,
                )}
              >
                {statusLabel}
              </span>
            </div>

            {/* Check image */}
            {payment.checkImage && (
              <div className="px-3.5 py-3 border-t border-gray-100">
                <p className="text-[12px] text-muted-foreground mb-2">
                  {t('payment.checkImage', { defaultValue: 'Check image' })}
                </p>
                <img
                  src={imageUrl(payment.checkImage)}
                  alt="Check"
                  className="max-h-40 w-full rounded-lg border border-gray-100 object-contain"
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </ModalWrapper>
  )
}