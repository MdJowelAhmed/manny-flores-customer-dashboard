import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  fmtUsd,
  parseAmountToNumber,
  type Estimate,
} from '../estimatesData'
import {
  formatProjectInvoiceStatusLabel,
  normalizeProjectInvoiceStatus,
  projectInvoiceStatusBadgeVariant,
} from '@/pages/Invoice/invoicesData'

interface EstimateListCardProps {
  estimate: Estimate
  onViewDetails: (estimate: Estimate) => void
  viewDetailsLabel: string
}

export function EstimateListCard({
  estimate,
  onViewDetails,
  viewDetailsLabel,
}: EstimateListCardProps) {
  const totalNum = parseAmountToNumber(estimate.amount)
  const projectStatus = normalizeProjectInvoiceStatus(estimate.projectStatus)
  const statusLabel = formatProjectInvoiceStatusLabel(projectStatus)
  const projectName = estimate.project?.trim() || '—'
  const customerName = estimate.customerName?.trim() || '—'

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">{estimate.estimateCode}</span>
          <Badge variant={projectInvoiceStatusBadgeVariant(projectStatus)}>
            {statusLabel}
          </Badge>
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
              {estimate.totalDate != null ? estimate.totalDate : '—'}
            </span>
          </p>
          <p className="text-gray-600">
            <span className="text-gray-500">Total Amount: </span>
            <span className="font-bold text-[#22c55e]">{fmtUsd(totalNum)}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 sm:items-center">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 sm:w-auto"
          onClick={() => onViewDetails(estimate)}
        >
          {viewDetailsLabel}
        </Button>
      </div>
    </div>
  )
}
