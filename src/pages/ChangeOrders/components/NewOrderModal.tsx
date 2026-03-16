import { useState } from 'react'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ChangeOrder, ChangeOrderStatus } from '../changeOrdersData'

interface NewOrderModalProps {
  open: boolean
  onClose: () => void
  onCreate: (order: ChangeOrder) => void
}

export function NewOrderModal({ open, onClose, onCreate }: NewOrderModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [originalAmount, setOriginalAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState('')

  const reset = () => {
    setCustomerName('')
    setProjectName('')
    setDescription('')
    setOriginalAmount('')
    setTotalAmount('')
  }

  const handleSubmit = () => {
    const original = Number(originalAmount || 0)
    const total = Number(totalAmount || original)
    const additional = total - original

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    const status: ChangeOrderStatus = 'Pending'

    const newOrder: ChangeOrder = {
      id: `co-${Date.now()}`,
      orderId: `CO-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 900) + 100
      )}`,
      customerName: customerName || 'New Customer',
      projectName: projectName || 'New Project',
      company: '',
      originalCost: original,
      additionalCost: additional,
      newTotal: total,
      requestDate: today,
      status,
      projectStartDate: today,
      amountSpent: 0,
      totalBudget: total,
      duration: '',
      remaining: total,
      email: '',
      reasonForChange: '',
      description: description || '',
    }

    onCreate(newOrder)
    reset()
    onClose()
  }

  const disableSave = !customerName || !projectName || !originalAmount || !totalAmount

  return (
    <ModalWrapper
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="New Order"
      description="Create a new base order before change orders."
      size="md"
      className="bg-white max-w-2xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={disableSave} onClick={handleSubmit}>
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Customer Name
            </label>
            <Input
              placeholder="Enter Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Select Project
            </label>
            <Input
              placeholder="Choose Project..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Original Amount
            </label>
            <Input
              placeholder="0.00"
              type="number"
              value={originalAmount}
              onChange={(e) => setOriginalAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Total Amount
            </label>
            <Input
              placeholder="0.00"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}

