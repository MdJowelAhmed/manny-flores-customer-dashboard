import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Estimate } from '../estimatesData'
import { toast } from 'sonner'
import { format, parse } from 'date-fns'

const ESTIMATE_STATUS_OPTIONS = [
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Follow Up', label: 'Follow Up' },
]

const CUSTOMER_OPTIONS = [
  { value: 'Sarah Johnson', label: 'Sarah Johnson' },
  { value: 'Mike Johnson', label: 'Mike Johnson' },
  { value: 'Michael Chen', label: 'Michael Chen' },
  { value: 'Lisa Anderson', label: 'Lisa Anderson' },
  { value: 'Emily Davis', label: 'Emily Davis' },
  { value: 'Robert Brown', label: 'Robert Brown' },
  { value: 'Maria Garcia', label: 'Maria Garcia' },
  { value: 'John Williams', label: 'John Williams' },
]

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
  const [projectName, setProjectName] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [amountDue, setAmountDue] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (estimate && open) {
      setCustomerName(estimate.customerName)
      setEmail(estimate.email)
      setCompany(estimate.company)
      setProjectName(estimate.project)
      setAmountDue(estimate.amountDue || estimate.amount)
      setStatus(estimate.status)
      try {
        const parsed = parse(estimate.startDate, 'd/M/yyyy', new Date())
        setStartDate(isNaN(parsed.getTime()) ? undefined : parsed)
      } catch {
        setStartDate(undefined)
      }
    }
  }, [estimate, open])

  const handleSave = () => {
    if (!estimate) return
    const updated: Estimate = {
      ...estimate,
      customerName,
      email,
      company,
      project: projectName,
      startDate: startDate ? format(startDate, 'd/M/yyyy') : estimate.startDate,
      amountDue,
      amount: amountDue,
      status: status as Estimate['status'],
    }
    onSave?.(updated)
    toast.success('Estimate updated successfully')
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Estimate' : 'Edit Project'}
      size="lg"
      className="max-w-3xl bg-white"
      footer={
        <div className="flex justify-end gap-2">
      
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Customer Information
          </h3>
          <div className=" grid grid-cols-2 gap-6">
            <FormSelect
              label="Customer name"
              value={customerName}
              options={CUSTOMER_OPTIONS}
              onChange={setCustomerName}
              placeholder="Select customer"
              triggerClassName="bg-gray-50"
            />
            <FormInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50"
            />
            <FormInput
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="bg-gray-50"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Project Information
          </h3>
          <div className=" grid grid-cols-2 gap-6">
            <FormInput
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-gray-50"
            />
            <DatePicker
              label="Start date"
              value={startDate}
              onChange={setStartDate}
              placeholder="dd/mm/yyyy"
            />
            <FormInput
              label="Amount Due"
              value={amountDue}
              onChange={(e) => setAmountDue(e.target.value)}
              className="bg-gray-50"
            />
            <FormSelect
              label="Status"
              value={status}
              options={ESTIMATE_STATUS_OPTIONS}
              onChange={setStatus}
              placeholder="Select status"
              triggerClassName="bg-gray-50"
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
