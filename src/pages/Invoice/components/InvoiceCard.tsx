import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  fmtInvoiceUsd,
  formatProjectInvoiceStatusLabel,
  projectInvoiceStatusBadgeVariant,
  type Invoice,
} from '../invoicesData'

interface InvoiceCardProps {
  invoice: Invoice
  viewLabel: string
  onView: (invoice: Invoice) => void
}

export function InvoiceCard({ invoice, viewLabel, onView }: InvoiceCardProps) {
  const statusLabel = formatProjectInvoiceStatusLabel(invoice.projectStatus)
  const badgeVariant = projectInvoiceStatusBadgeVariant(invoice.projectStatus)
  const projectName = invoice.projectName?.trim() || invoice.materialSummary?.trim() || '—'
  const customerName = invoice.customerName?.trim() || '—'

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">{invoice.refCode}</span>
          <Badge variant={badgeVariant}>{statusLabel}</Badge>
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900 truncate">{projectName}</p>
          <p className="text-sm text-gray-600 truncate">
            <span className="text-gray-500">Customer: </span>
            {customerName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <p className="text-gray-600">
            <span className="text-gray-500">Total Days: </span>
            <span className="font-medium text-gray-900">
              {invoice.totalDate != null ? invoice.totalDate : '—'}
            </span>
          </p>
          <p className="text-gray-600">
            <span className="text-gray-500">Total Amount: </span>
            <span className="font-bold text-[#22c55e]">{fmtInvoiceUsd(invoice.amount)}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
          onClick={() => onView(invoice)}
        >
          {viewLabel}
        </Button>
      </div>
    </div>
  )
}
