import { useState } from 'react'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ChangeOrder, ChangeOrderStatus } from '../changeOrdersData'

interface NewChangeOrderModalProps {
  open: boolean
  onClose: () => void
  onCreate: (order: ChangeOrder) => void
}

export function NewChangeOrderModal({
  open,
  onClose,
  onCreate,
}: NewChangeOrderModalProps) {
  const [projectName, setProjectName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [changeAmount, setChangeAmount] = useState('')
  const [description, setDescription] = useState('')
  const [reason, setReason] = useState('')

  const reset = () => {
    setProjectName('')
    setCustomerName('')
    setChangeAmount('')
    setDescription('')
    setReason('')
  }

  const handleSubmit = () => {
    const amount = Number(changeAmount || 0)
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const baseStatus: ChangeOrderStatus = 'Pending'

    const newOrder: ChangeOrder = {
      id: `co-${Date.now()}`,
      orderId: `CO-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 900) + 100
      )}`,
      customerName: customerName || 'New Customer',
      projectName: projectName || 'New Project',
      company: '',
      originalCost: 0,
      additionalCost: amount,
      newTotal: amount,
      requestDate: today,
      status: baseStatus,
      projectStartDate: today,
      amountSpent: 0,
      totalBudget: amount,
      duration: '',
      remaining: amount,
      email: '',
      reasonForChange: reason || '',
      description: description || '',
    }

    onCreate(newOrder)
    reset()
    onClose()
  }

  const disableSubmit = !projectName || !customerName || !changeAmount

  return (
    <ModalWrapper
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="New Change Order"
      description="Create a new project change order."
      size="md"
      className="bg-white"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={disableSubmit} onClick={handleSubmit}>
            Create Change Order
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Select Project
            </label>
            <Input
              placeholder="Choose project..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Change amount
            </label>
            <Input
              placeholder="0.00"
              type="number"
              value={changeAmount}
              onChange={(e) => setChangeAmount(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Customer name
          </label>
          <Input
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Description
          </label>
          <Textarea
            placeholder="Describe the change order"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Reason
          </label>
          <Textarea
            placeholder="e.g., Customer requested upgrade, design modification"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
    </ModalWrapper>
  )
}

