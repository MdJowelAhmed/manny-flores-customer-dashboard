import { fmtInvoiceUsd, type Invoice } from '../invoicesData'
import { Badge } from '@/components/ui/badge'

interface InvoiceCardProps {
  invoice: Invoice
  viewLabel: string
  onView: (invoice: Invoice) => void
}

export function InvoiceCard({ invoice, viewLabel, onView }: InvoiceCardProps) {
  const status = invoice.status ?? 'pending'
  const badgeVariant =
    status === 'paid' ? 'success' : status === 'overdue' ? 'error' : status === 'draft' ? 'secondary' : 'warning'

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{invoice.refCode}</span>
          <Badge variant={badgeVariant} className="capitalize">
            {status}
          </Badge>
        </div>
        <span className="shrink-0 rounded-lg bg-[#22c55e] px-3 py-1.5 text-sm font-semibold text-white">
          {fmtInvoiceUsd(invoice.amount)}
        </span>
      </div>
      <p className="mt-3 text-lg font-bold text-gray-900">{invoice.customerName}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-gray-500">
          <span>• {invoice.materialSummary}</span>
          <span> • Qty: {invoice.summaryQty}</span>
          <span> • Cost: {invoice.summaryCostCount}</span>
        </p>
        <button
          type="button"
          onClick={() => onView(invoice)}
          className="shrink-0 self-start text-left text-sm font-medium text-blue-600 hover:text-blue-700 hover:text-bold underline sm:self-auto"
        >
          {viewLabel}
        </button>
      </div>
    </div>
  )
}
