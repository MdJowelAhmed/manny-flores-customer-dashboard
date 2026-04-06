import {
  Check,
  Download,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import {
  ESTIMATE_STATUS_BADGE,
  computeEstimateTotals,
  getLineItemsForEstimate,
  type Estimate,
} from '../estimatesData'
import { toast } from 'sonner'

interface EstimateViewModalProps {
  open: boolean
  onClose: () => void
  estimate: Estimate | null
  onEdit?: (estimate: Estimate) => void
}

function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900">
        {value}
      </div>
    </div>
  )
}

export function EstimateViewModal({
  open,
  onClose,
  estimate,
  onEdit,
}: EstimateViewModalProps) {
  if (!estimate) return null

  const lineItems = getLineItemsForEstimate(estimate)
  const taxRate = estimate.taxRatePercent ?? 15
  const { subtotal, tax, total } = computeEstimateTotals(lineItems, taxRate)

  const statusBadge =
    ESTIMATE_STATUS_BADGE[estimate.status] ?? {
      bg: 'bg-white border border-gray-300',
      text: 'text-gray-700',
    }

  const businessLine =
    estimate.businessProjectDetail ??
    [estimate.company, estimate.project].filter(Boolean).join(', ')

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={`Estimate: ${estimate.estimateCode}`}
      size="full"
      className="max-w-5xl w-[min(56rem,96vw)] bg-white p-6 sm:rounded-xl"
      footer={
        <div className="w-full space-y-5">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Send & download */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Send className="h-4 w-4 text-gray-600" />
                Send
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 gap-2 rounded-lg border-gray-200 bg-white font-medium text-gray-800 hover:bg-gray-50"
                  onClick={() =>
                    toast.message('Estimate will be sent by email.', {
                      description: estimate.email,
                    })
                  }
                >
                  <Mail className="h-4 w-4" />
                  Via Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 gap-2 rounded-lg border-emerald-200 bg-white font-medium text-emerald-700 hover:bg-emerald-50"
                  onClick={() =>
                    toast.message('Opening WhatsApp…', {
                      description: estimate.contactNumber ?? 'No number on file',
                    })
                  }
                >
                  <MessageCircle className="h-4 w-4" />
                  Via WhatsApp
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full gap-2 rounded-lg border-gray-200 bg-white font-medium text-gray-800 hover:bg-gray-50"
                onClick={() =>
                  toast.success('PDF download will start when connected.')
                }
              >
                <Download className="h-4 w-4" />
                Download pdf
              </Button>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-medium text-gray-800">
                  <span>Subtotal</span>
                  <span>{fmtUsd(subtotal)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-800">
                    Tax ({taxRate}%)
                  </span>
                  <span className="text-red-500">
                    +{fmtUsd(tax)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-[#22c55e]">{fmtUsd(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-[100px] rounded-lg border-gray-200 bg-white font-medium"
              onClick={onClose}
            >
              Cancel
            </Button>
            {onEdit ? (
              <Button
                type="button"
                className="h-10 min-w-[120px] rounded-lg bg-[#22c55e] font-semibold text-white hover:bg-[#16a34a]"
                onClick={() => onEdit(estimate)}
              >
                Edit
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-8 pb-2">
        {/* Business Information */}
        <section>
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Business Information
          </h3>
          <div className="space-y-4">
            <ReadField label="Project Name" value={businessLine} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadField
                label="Estimate Number"
                value={estimate.estimateCode}
              />
              <ReadField
                label="Start date"
                value={estimate.startDate}
              />
            </div>
          </div>
        </section>

        {/* Customer Information */}
        <section>
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadField
              label="Customer Name"
              value={estimate.customerName}
            />
            <ReadField label="Email" value={estimate.email} />
            <ReadField label="Company" value={estimate.company || '—'} />
            <ReadField
              label="Contact Number"
              value={estimate.contactNumber ?? '—'}
            />
            <div className="space-y-1.5 sm:col-span-2">
              <p className="text-sm font-medium text-gray-800">Status</p>
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                <span
                  className={cn(
                    'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                    statusBadge.bg,
                    statusBadge.text
                  )}
                >
                  {estimate.status}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Line items */}
        <section>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Item description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Unit cost
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Tax
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {lineItems.map((row, index) => {
                  const lineTotal = row.unitCost * row.qty
                  return (
                    <tr key={`${index}-${row.description}`}>
                      <td className="px-4 py-4 text-gray-900">
                        {row.description}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-800">
                        {fmtUsd(row.unitCost)}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-800">
                        {row.qty}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          {row.taxable ? (
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center rounded border border-emerald-500 bg-emerald-50"
                              title="Taxable"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                            </span>
                          ) : (
                            <span
                              className="inline-flex h-6 w-6 rounded border border-gray-300 bg-white"
                              title="Not taxable"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900">
                        {fmtUsd(lineTotal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </ModalWrapper>
  )
}
