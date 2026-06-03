import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  formatEstimateCardDate,
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
  const material = estimate.materialSummary ?? estimate.project
  const qty = estimate.summaryQty ?? 0
  const costN = estimate.summaryCostCount ?? 0
  const totalNum = parseAmountToNumber(estimate.amount)
  const projectStatus = normalizeProjectInvoiceStatus(estimate.projectStatus)
  const statusLabel = formatProjectInvoiceStatusLabel(projectStatus)

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">{estimate.estimateCode}</span>
          <Badge variant={projectInvoiceStatusBadgeVariant(projectStatus)}>
            {statusLabel}
          </Badge>
        </div>
        <p className="text-lg font-bold text-gray-900">{estimate.customerName}</p>
        <p className="text-sm text-gray-500">
          <span className="text-gray-500">• {material}</span>
          <span className="text-gray-500"> • Qty: {qty}</span>
          <span className="text-gray-500"> • Cost: {costN}</span>
        </p>
        <p className="text-sm text-gray-500">
          <span>Total: </span>
          <span className="font-bold text-[#22c55e]">{fmtUsd(totalNum)}</span>
          {estimate.totalDate != null ? (
            <span className="text-gray-500"> • {estimate.totalDate} days</span>
          ) : null}
          <span className="text-gray-500"> • {formatEstimateCardDate(estimate.startDate)}</span>
        </p>
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
