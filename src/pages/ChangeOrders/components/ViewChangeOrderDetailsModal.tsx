import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Calendar, User, Info } from 'lucide-react'
import type { ChangeOrderStatus } from '../changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface ViewChangeOrderDetailsModalProps {
  open: boolean
  onClose: () => void
  order: any | null
  onStatusUpdate?: (orderId: string, status: ChangeOrderStatus) => void
}

function DetailRow({
  label,
  value,
  valueHighlight,
}: {
  label: string
  value: string | number
  valueHighlight?: boolean
}) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span
        className={cn(
          'text-sm ',
          valueHighlight ? 'text-amber-600' : 'text-foreground'
        )}
      >
        {typeof value === 'number' ? formatCurrency(value) : value}
      </span>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 rounded bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  )
}

export function ViewChangeOrderDetailsModal({
  open,
  onClose,
  order,
  onStatusUpdate,
}: ViewChangeOrderDetailsModalProps) {
  if (!order) return null

  const handleStatusChange = (status: ChangeOrderStatus) => {
    onStatusUpdate?.(order.id, status)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={`#${order.id?.slice(0, 8).toUpperCase()}`}
      description="Complete change order details and approval status"
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-6">
        <div>
          <SectionHeader icon={Calendar} title="Project Information" />
          <div className="space-y-1 pl-9">
            <DetailRow label="Project Name" value={order.project?.estimates?.projectName || 'N/A'} />
            <DetailRow label="Start Date" value={order.project?.estimates?.estimateStartDate ? new Date(order.project.estimates.estimateStartDate).toLocaleDateString() : 'N/A'} />
            <DetailRow
              label="Original Cost"
              value={order.originalCost || 0}
              valueHighlight
            />
            <DetailRow label="Total Amount" value={order.totalCost || 0} />
            <DetailRow label="Reason" value={order.reasonForChange || 'N/A'} />
          </div>
        </div>

        <div>
          <SectionHeader icon={User} title="Customer Information" />
          <div className="space-y-1 pl-9">
            <DetailRow label="Customer name" value={order.project?.estimates?.customerName || order.user?.name || 'N/A'} />
            <DetailRow label="Email" value={order.project?.estimates?.customerEmail || order.user?.email || 'N/A'} />
            <DetailRow label="Address" value={order.project?.estimates?.customerAddress || 'N/A'} />
          </div>
        </div>

        <div>
          <SectionHeader icon={Info} title="Description" />
          <p className="text-sm text-muted-foreground pl-9 leading-relaxed">
            {order.description || 'No description provided.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t justify-end">
          {order.status === 'PENDING' && (
            <Button
              onClick={() => handleStatusChange('APPROVED')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Approve
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  )
}
