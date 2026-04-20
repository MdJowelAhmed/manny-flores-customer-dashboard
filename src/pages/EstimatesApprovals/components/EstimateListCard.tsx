import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import {
  ESTIMATE_LIST_BADGE,
  formatEstimateCardDate,
  fmtUsd,
  parseAmountToNumber,
  type Estimate,
} from '../estimatesData'

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
  const badge = ESTIMATE_LIST_BADGE[estimate.status]
  const material = estimate.materialSummary ?? estimate.project
  const qty = estimate.summaryQty ?? 0
  const costN = estimate.summaryCostCount ?? 0
  const totalNum = parseAmountToNumber(estimate.amount)

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">{estimate.estimateCode}</span>
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
              badge.className
            )}
          >
            {badge.label}
          </span>
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
          <span className="text-gray-500"> • {formatEstimateCardDate(estimate.startDate)}</span>
        </p>
      </div>
      <div className="flex shrink-0 sm:items-center">
        <Button
          type="button"
          className="h-11 w-full rounded-xl bg-[#22c55e] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#16a34a] sm:w-auto"
          onClick={() => onViewDetails(estimate)}
        >
          {viewDetailsLabel}
        </Button>
      </div>
    </div>
  )
}
