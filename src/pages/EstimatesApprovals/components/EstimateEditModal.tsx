import { useState, useEffect, useMemo } from 'react'
import {
  Download,
  Mail,
  MessageCircle,
  Plus,
  Send,
  Trash2,
} from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import {
  computeEstimateTotals,
  getLineItemsForEstimate,
  type Estimate,
  type EstimateLineItem,
} from '../estimatesData'
import { toast } from 'sonner'
import { format, parse } from 'date-fns'

const ESTIMATE_STATUS_OPTIONS = [
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Follow Up', label: 'Follow Up' },
]

const fieldInputClass =
  'bg-white border-gray-200 rounded-lg shadow-none focus-visible:ring-gray-300'

function fmtUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

interface EstimateEditModalProps {
  open: boolean
  onClose: () => void
  estimate: Estimate | null
  onSave?: (estimate: Estimate) => void
  mode?: 'edit' | 'create'
}

export function EstimateEditModal({
  open,
  onClose,
  estimate,
  onSave,
  mode = 'edit',
}: EstimateEditModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [businessProjectDetail, setBusinessProjectDetail] = useState('')
  const [estimateCode, setEstimateCode] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [status, setStatus] = useState('')
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([])
  const [taxRatePercent, setTaxRatePercent] = useState(15)

  useEffect(() => {
    if (!estimate || !open) return

    setCustomerName(estimate.customerName)
    setEmail(estimate.email)
    setCompany(estimate.company)
    setContactNumber(estimate.contactNumber ?? '')
    setBusinessProjectDetail(
      estimate.businessProjectDetail ??
        [estimate.company, estimate.project].filter(Boolean).join(', ')
    )
    setEstimateCode(mode === 'create' ? '' : estimate.estimateCode)
    setStatus(estimate.status)
    setTaxRatePercent(estimate.taxRatePercent ?? 15)

    const fromLines = estimate.lineItems?.length
      ? estimate.lineItems.map((l) => ({ ...l }))
      : getLineItemsForEstimate(estimate).map((l) => ({ ...l }))

    if (mode === 'create') {
      setLineItems(
        estimate.lineItems?.length
          ? fromLines
          : [{ description: '', unitCost: 0, qty: 1, taxable: true }]
      )
    } else {
      setLineItems(
        fromLines.length
          ? fromLines
          : [{ description: '', unitCost: 0, qty: 1, taxable: true }]
      )
    }

    try {
      const parsed = parse(estimate.startDate, 'd/M/yyyy', new Date())
      setStartDate(isNaN(parsed.getTime()) ? undefined : parsed)
    } catch {
      setStartDate(undefined)
    }
  }, [estimate, open, mode])

  const { subtotal, tax, total } = useMemo(
    () => computeEstimateTotals(lineItems, taxRatePercent),
    [lineItems, taxRatePercent]
  )

  const primaryProjectLabel = useMemo(() => {
    const fromLine = lineItems.find((l) => l.description.trim())?.description.trim()
    const fromBusiness = businessProjectDetail.split(',')[0]?.trim()
    const fallbackProject = estimate?.project ?? ''
    return fromLine || fromBusiness || fallbackProject || 'New estimate'
  }, [lineItems, businessProjectDetail, estimate])

  const updateLine = (index: number, patch: Partial<EstimateLineItem>) => {
    setLineItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  const removeLine = (index: number) => {
    setLineItems((prev) =>
      prev.length <= 1
        ? [{ description: '', unitCost: 0, qty: 1, taxable: true }]
        : prev.filter((_, i) => i !== index)
    )
  }

  const addLine = () => {
    setLineItems((prev) => [
      ...prev,
      { description: '', unitCost: 0, qty: 1, taxable: false },
    ])
  }

  const handleSave = () => {
    if (!estimate) return
    const amountEuro = `€${Math.round(total).toLocaleString('en-US')}`
    const updated: Estimate = {
      ...estimate,
      customerName,
      email,
      company,
      contactNumber: contactNumber || undefined,
      businessProjectDetail:
        businessProjectDetail.trim() || undefined,
      project: primaryProjectLabel,
      estimateCode: mode === 'create' ? estimate.estimateCode : estimateCode,
      startDate: startDate ? format(startDate, 'd/M/yyyy') : estimate.startDate,
      amount: amountEuro,
      amountDue: fmtUsd(total),
      status: status as Estimate['status'],
      lineItems: lineItems.map((l) => ({ ...l })),
      taxRatePercent,
    }
    onSave?.(updated)
    toast.success(
      mode === 'create'
        ? 'Estimate created successfully'
        : 'Estimate updated successfully'
    )
    onClose()
  }

  if (!estimate) return null

  const modalTitle =
    mode === 'create'
      ? 'Create New Estimate'
      : `Edit Estimate: ${estimate.estimateCode}`

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="full"
      className="max-w-5xl w-[min(56rem,96vw)] bg-white p-6 sm:rounded-xl"
      footer={
        <div className="w-full space-y-5">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
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
                      description: email || 'Add an email address',
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
                      description: contactNumber || 'No number on file',
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

            <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Tax rate (%)</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className={cn('h-9 w-20 text-right', fieldInputClass)}
                  value={taxRatePercent}
                  onChange={(e) =>
                    setTaxRatePercent(Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-3 border-t border-gray-100 pt-3 text-sm">
                <div className="flex justify-between font-medium text-gray-800">
                  <span>Subtotal</span>
                  <span>{fmtUsd(subtotal)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-800">Tax ({taxRatePercent}%)</span>
                  <span className="text-red-500">+{fmtUsd(tax)}</span>
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
            <Button
              type="button"
              className="h-10 min-w-[140px] rounded-lg bg-[#22c55e] font-semibold text-white hover:bg-[#16a34a]"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-8 pb-2">
        <section>
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Business Information
          </h3>
          <div className="space-y-4">
            <FormInput
              label="Project Name"
              value={businessProjectDetail}
              onChange={(e) => setBusinessProjectDetail(e.target.value)}
              className={fieldInputClass}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                label="Estimate Number"
                value={mode === 'create' ? '' : estimateCode}
                placeholder={
                  mode === 'create' ? 'Assigned on save' : undefined
                }
                readOnly={mode === 'create'}
                onChange={(e) => setEstimateCode(e.target.value)}
                className={cn(
                  fieldInputClass,
                  mode === 'create' && 'cursor-not-allowed text-muted-foreground'
                )}
              />
              <DatePicker
                label="Start date"
                value={startDate}
                onChange={setStartDate}
                placeholder="dd/mm/yyyy"
                triggerClassName={cn(fieldInputClass, 'font-normal')}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Customer Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={fieldInputClass}
            />
            <FormInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldInputClass}
            />
            <FormInput
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={fieldInputClass}
            />
            <FormInput
              label="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className={fieldInputClass}
            />
            <FormSelect
              label="Status"
              value={status}
              options={ESTIMATE_STATUS_OPTIONS}
              onChange={setStatus}
              placeholder="Select status"
              className="sm:col-span-2"
              triggerClassName={fieldInputClass}
            />
          </div>
        </section>

        <section>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Item description
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Unit cost
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Qty
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Tax
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Total
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {lineItems.map((row, index) => {
                  const lineTotal = row.unitCost * row.qty
                  return (
                    <tr key={`line-${index}`}>
                      <td className="px-3 py-2 align-middle">
                        <Input
                          value={row.description}
                          onChange={(e) =>
                            updateLine(index, {
                              description: e.target.value,
                            })
                          }
                          className={cn('h-9', fieldInputClass)}
                          placeholder="Description"
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <Input
                          type="number"
                          min={0}
                          value={row.unitCost || ''}
                          onChange={(e) =>
                            updateLine(index, {
                              unitCost: Number(e.target.value) || 0,
                            })
                          }
                          className={cn('h-9 text-right', fieldInputClass)}
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <Input
                          type="number"
                          min={0}
                          value={row.qty || ''}
                          onChange={(e) =>
                            updateLine(index, {
                              qty: Number(e.target.value) || 0,
                            })
                          }
                          className={cn('h-9 text-center', fieldInputClass)}
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="flex justify-center pt-1">
                          <Checkbox
                            checked={row.taxable}
                            onCheckedChange={(c) =>
                              updateLine(index, { taxable: c === true })
                            }
                            className="border-gray-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2 align-middle text-right font-medium text-gray-900">
                        {fmtUsd(lineTotal)}
                      </td>
                      <td className="px-3 py-2 align-middle text-right">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="inline-flex rounded-md p-1.5 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Remove line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              className="gap-2 rounded-lg bg-[#22c55e] font-semibold text-white hover:bg-[#16a34a]"
              onClick={addLine}
            >
              <Plus className="h-4 w-4" />
              Add New Item
            </Button>
          </div>
        </section>
      </div>
    </ModalWrapper>
  )
}
