import { FileText, Calendar } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { STATUS_COLORS } from '@/utils/constants'
import { cn } from '@/utils/cn'
import type { Estimate } from '../estimatesData'

interface EstimateViewModalProps {
  open: boolean
  onClose: () => void
  estimate: Estimate | null
  onEdit?: (estimate: Estimate) => void
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

export function EstimateViewModal({
  open,
  onClose,
  estimate,
  onEdit: _onEdit,
}: EstimateViewModalProps) {
  if (!estimate) return null

  const statusConfig = STATUS_COLORS[estimate.status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={estimate.estimateCode}
      size="md"
      className="max-w-lg bg-white"
      // footer={
      //   onEdit ? (
      //     <Button
      //       className="bg-green-600 hover:bg-green-700 text-white"
      //       onClick={() => {
      //         onEdit(estimate)
      //         onClose()
      //       }}
      //     >
      //       Edit
      //     </Button>
      //   ) : undefined
      // }
    >
      <div className="space-y-6">
        {/* Customer Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-full bg-green-100">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Customer Information
            </h3>
          </div>
          <div className="space-y-0 pl-8">
            <DetailRow label="Customer" value={estimate.customerName} />
            <DetailRow label="Email" value={estimate.email} />
            <DetailRow label="Company" value={estimate.company} />
          </div>
        </div>

        {/* Project Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-full bg-green-100">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Project Information
            </h3>
          </div>
          <div className="space-y-0 pl-8">
            <DetailRow label="Project Name" value={estimate.project} />
            <DetailRow
              label="Start Date"
              value={estimate.startDateFormatted || estimate.startDate}
            />
            <DetailRow label="Amount" value={estimate.amountDue || estimate.amount} />
            <DetailRow
              label="Status"
              value={estimate.status}
              valueClassName={cn(statusConfig.text, 'font-medium')}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
