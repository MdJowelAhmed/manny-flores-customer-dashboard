import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import type { ChangeOrder } from '../changeOrdersData'

interface ChangeOrderCardProps {
  order: ChangeOrder
  index: number
  onChangeStatus: () => void
  onUploadDocument: () => void
  onNewChangeOrder: () => void
  onApprove?: () => void
  onReject?: () => void
}

export function ChangeOrderCard({
  order,
  index,
  onChangeStatus,
  onUploadDocument,
  onNewChangeOrder,
  onApprove,
  onReject,
}: ChangeOrderCardProps) {
  const isNegativeChange = order.additionalCost < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 * index }}
      className="rounded-2xl bg-white border border-[#F3E8FF] shadow-[0_8px_24px_rgba(15,23,42,0.04)] overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-6 pt-5">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-[#0F172A]">
              {order.orderId}
            </span>
            <button
              type="button"
              onClick={onChangeStatus}
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors',
                order.status === 'Approved' &&
                'bg-emerald-50 text-emerald-700 border border-emerald-100',
                order.status === 'Pending' &&
                'bg-[#FFF4E5] text-[#FF8A00] border border-[#FFE1B5]',
                order.status === 'Rejected' &&
                'bg-red-50 text-red-600 border border-red-100'
              )}
            >
              {order.status}
            </button>
          </div>
          <div>
            <p className="font-semibold text-base text-[#0F172A]">{order.customerName}</p>
            <p className="text-sm text-accent">{order.projectName}</p>
          </div>
          <div className="text-sm text-accent">
            <span className="font-medium text-[#0F172A]">Description: </span>
            {order.description}
          </div>
          <div className="text-sm text-accent">
            <span className="font-medium text-[#0F172A]">Reason: </span>
            {order.reasonForChange}
          </div>
        </div>

        <div className="flex flex-col items-end gap-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm px-4 bg-white border border-slate-200 hover:bg-slate-50 h-9"
              onClick={onUploadDocument}
            >
              Upload Document
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm px-4 bg-primary text-white  border-slate-200 h-9"
              onClick={onNewChangeOrder}
            >
              New Change Order
            </Button>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-accent">Requested</span>
            <span className="text-base font-bold text-foreground">
              {order.requestDate}
            </span>
          </div>
          {order.approvedDate && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-accent">Approved</span>
              <span className="text-base font-bold text-foreground">
                {order.approvedDate}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-[#9810FA0D] px-6 py-4 flex flex-wrap items-center gap-6 rounded-xl mx-10 mb-4">
        <AmountItem label="Original Amount" value={order.originalCost} />
        <AmountItem
          label="Change Amount"
          value={order.additionalCost}
          highlight
          negative={isNegativeChange}
        />
        <AmountItem label="Total Amount" value={order.newTotal} strong />

        <div className="ml-auto flex items-center gap-3">
          {onReject && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm px-6 bg-[#FFE5E9] text-[#FF4B4B] border-none hover:bg-[#FFD6DD]"
              onClick={onReject}
            >
              Reject
            </Button>
          )}
          {onApprove && (
            <Button
              size="sm"
              className="rounded-sm px-6 bg-[#00A63E] text-white hover:bg-[#009037]"
              onClick={onApprove}
            >
              Approve
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface AmountItemProps {
  label: string
  value: number
  highlight?: boolean
  strong?: boolean
  negative?: boolean
}

function AmountItem({ label, value, highlight, strong, negative }: AmountItemProps) {
  const formatted = formatCurrency(Math.abs(value))
  const sign = negative ? '-' : value > 0 ? '+' : ''

  return (
    <div className="space-y-1 min-w-[120px]">
      <p className="text-xs text-[#64748B]">{label}</p>
      <p
        className={cn(
          'text-sm',
          strong && 'font-semibold text-[#0F172A]',
          highlight && negative && 'font-semibold text-[#FF4B4B]',
          highlight && !negative && 'font-semibold text-[#00A63E]'
        )}
      >
        {highlight ? `${sign}${formatted}` : formatted}
      </p>
    </div>
  )
}

