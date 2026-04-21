import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { fmtInvoiceUsd, getInvoiceBreakdown, type Invoice, type InvoiceStatus } from '../invoicesData'

interface InvoiceViewModalProps {
  open: boolean
  onClose: () => void
  invoice: Invoice | null
}

function safeFormatDate(iso: string, fmt: string) {
  try {
    return format(parseISO(iso), fmt)
  } catch {
    return iso
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left transition-colors hover:bg-gray-100/80"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-gray-900">{title}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">{children}</div>
      ) : null}
    </div>
  )
}

function statusBadgeVariant(status: InvoiceStatus): 'warning' | 'success' | 'error' | 'secondary' {
  switch (status) {
    case 'paid':
      return 'success'
    case 'overdue':
      return 'error'
    case 'draft':
      return 'secondary'
    default:
      return 'warning'
  }
}

export function InvoiceViewModal({ open, onClose, invoice }: InvoiceViewModalProps) {
  const { t } = useTranslation()
  if (!invoice) return null

  const breakdown = getInvoiceBreakdown(invoice)
  const issueStr = safeFormatDate(invoice.invoiceDate, 'dd/MM/yyyy')
  const dueStr = invoice.dueDate ? safeFormatDate(invoice.dueDate, 'dd/MM/yyyy') : '—'
  const status = invoice.status ?? 'pending'

  const statusLabel = t(`invoice.status.${status}`)

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={invoice.refCode}
      size="xl"
      className="max-w-2xl bg-white sm:rounded-xl"
      headerClassName="pb-2"
    >
      <div className="space-y-5 rounded-xl bg-gray-100/80 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={statusBadgeVariant(status)} className="capitalize">
            {statusLabel}
          </Badge>
          <div className="text-sm text-gray-600">
            <span className="text-gray-500">{t('invoice.dueDate')}: </span>
            <span className="font-medium text-gray-900">{dueStr}</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {t('invoice.customerInfo')}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">{invoice.customerName}</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">{t('invoice.email')}</span>
              <span className="text-right font-medium text-gray-900">{invoice.customerEmail}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">{t('invoice.phone')}</span>
              <span className="text-right font-medium text-gray-900">{invoice.customerPhone}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">{t('invoice.address')}</span>
              <span className="max-w-[65%] text-right font-medium text-gray-900">
                {invoice.customerAddress}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-2">
              <span className="text-gray-500">{t('invoice.issueDate')}</span>
              <span className="font-medium text-gray-900">{issueStr}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">{t('invoice.reference')}</span>
              <span className="font-medium text-gray-900">{invoice.refCode}</span>
            </div>
          </div>
        </div>

        <CollapsibleSection title={t('invoice.labor')}>
          <Row label={t('invoice.quantity')} value={String(breakdown.labor.quantity)} />
          <Row label={t('invoice.price')} value={fmtInvoiceUsd(breakdown.labor.price)} />
        </CollapsibleSection>

        <CollapsibleSection title={t('invoice.material')}>
          <Row label={t('invoice.name')} value={breakdown.material.name} />
          <Row label={t('invoice.quantity')} value={String(breakdown.material.quantity)} />
          <Row
            label={t('invoice.unitPricePerSqFt')}
            value={fmtInvoiceUsd(breakdown.material.unitPricePerSqFt)}
          />
          <Row label={t('invoice.lineTotal')} value={fmtInvoiceUsd(breakdown.material.totalPrice)} />
        </CollapsibleSection>

        <CollapsibleSection title={t('invoice.equipment')}>
          <Row label={t('invoice.name')} value={breakdown.equipment.name} />
          <Row label={t('invoice.quantity')} value={String(breakdown.equipment.quantity)} />
          <Row
            label={t('invoice.unitPricePerSqFt')}
            value={fmtInvoiceUsd(breakdown.equipment.unitPricePerSqFt)}
          />
          <Row label={t('invoice.lineTotal')} value={fmtInvoiceUsd(breakdown.equipment.totalPrice)} />
        </CollapsibleSection>

        <CollapsibleSection title={t('invoice.priceSection')}>
          <Row label={t('invoice.subtotal')} value={fmtInvoiceUsd(breakdown.subtotal)} />
          {breakdown.discountAmount > 0 ? (
            <Row label={t('invoice.discount')} value={`−${fmtInvoiceUsd(breakdown.discountAmount)}`} />
          ) : null}
          <Row
            label={t('invoice.taxWithPercent', { percent: breakdown.taxPercent })}
            value={fmtInvoiceUsd(breakdown.taxAmount)}
          />
          <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-base font-semibold">
            <span className="text-gray-800">{t('invoice.grandTotal')}</span>
            <span className="text-[#22c55e]">{fmtInvoiceUsd(breakdown.grandTotal)}</span>
          </div>
        </CollapsibleSection>

        {invoice.description ? (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{t('invoice.notes')}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-900">{invoice.description}</p>
          </div>
        ) : null}
      </div>
    </ModalWrapper>
  )
}
