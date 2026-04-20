import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { fmtInvoiceUsd, type Invoice } from '../invoicesData'

interface InvoiceViewModalProps {
  open: boolean
  onClose: () => void
  invoice: Invoice | null
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  )
}

export function InvoiceViewModal({ open, onClose, invoice }: InvoiceViewModalProps) {
  const { t } = useTranslation()
  if (!invoice) return null

  const dateStr = (() => {
    try {
      return format(parseISO(invoice.invoiceDate), 'dd/MM/yy')
    } catch {
      return invoice.invoiceDate
    }
  })()

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={invoice.refCode}
      size="md"
      className="max-w-md bg-white sm:rounded-xl"
      headerClassName="pb-2"
    >
      <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
        <Row label={t('invoice.customer')} value={invoice.customerName} />
        <Row label={t('invoice.issueDate')} value={dateStr} />
        <Row label={t('invoice.reference')} value={invoice.refCode} />
        <Row
          label={t('invoice.lineSummary')}
          value={`${invoice.materialSummary} · Qty ${invoice.summaryQty} · Cost ${invoice.summaryCostCount}`}
        />
        {invoice.description ? (
          <div className="py-2.5 text-sm">
            <p className="text-gray-500">{t('invoice.notes')}</p>
            <p className="mt-1 text-gray-900">{invoice.description}</p>
          </div>
        ) : null}
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-base font-semibold">
          <span className="text-gray-800">{t('invoice.total')}</span>
          <span className="text-[#22c55e]">{fmtInvoiceUsd(invoice.amount)}</span>
        </div>
      </div>
    </ModalWrapper>
  )
}
