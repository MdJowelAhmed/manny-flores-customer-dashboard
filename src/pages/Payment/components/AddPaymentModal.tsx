import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { PAYMENT_METHODS } from '../paymentsData'
import { toast } from 'sonner'
import type { Payment } from '../paymentsData'

const PROJECT_OPTIONS = [
  { value: 'Garden Design & Installation', label: 'Garden Design & Installation' },
  { value: 'Front Yard Landscaping', label: 'Front Yard Landscaping' },
  { value: 'Patio & Deck Construction', label: 'Patio & Deck Construction' },
  { value: 'Backyard Renovation', label: 'Backyard Renovation' },
  { value: 'Residential Backyard Renovation', label: 'Residential Backyard Renovation' },
]

interface AddPaymentModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Payment, 'id'>) => void
}

export function AddPaymentModal({
  open,
  onClose,
  onSubmit,
}: AddPaymentModalProps) {
  const { t } = useTranslation()
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [project, setProject] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [amountDue, setAmountDue] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')

  const handleSubmit = () => {
    const total = parseFloat(totalAmount) || 0
    const paid = parseFloat(paymentAmount) || 0
    const due = parseFloat(amountDue) || 0
    const outstanding = Math.max(0, due - paid)

    const status: Payment['status'] =
      outstanding <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending'

    onSubmit({
      invoice: invoiceNumber || `INV-${new Date().getFullYear()}-XXX`,
      customer: customerName,
      project,
      totalAmount: total,
      paidAmount: paid,
      outstandingAmount: outstanding,
      method: paymentMethod || 'Cash',
      status,
      paymentDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    })
    toast.success('Payment added successfully')
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setInvoiceNumber('')
    setCustomerName('')
    setProject('')
    setTotalAmount('')
    setAmountDue('')
    setPaymentMethod('')
    setPaymentAmount('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      title={t('payment.addPaymentTitle')}
      size="xl"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t('payment.cancel')}
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSubmit}
          >
            {t('payment.submit')}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-6">
        <FormInput
          label={t('payment.invoiceNumber')}
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder={t('payment.enterInvoiceNumber')}
          className="bg-gray-50"
        />
        <FormInput
          label={t('payment.customerName')}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder={t('payment.enterCustomerName')}
          className="bg-gray-50"
        />
        <FormSelect
          label={t('payment.projectName')}
          value={project}
          options={PROJECT_OPTIONS}
          onChange={setProject}
          placeholder={t('payment.chooseProject')}
          triggerClassName="bg-gray-50"
        />
        <FormSelect
          label={t('payment.paymentMethod')}
          value={paymentMethod}
          options={PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label }))}
          onChange={setPaymentMethod}
          placeholder="Select method"
          triggerClassName="bg-gray-50"
        />
        <FormInput
          label={t('payment.totalAmount')}
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder={t('payment.enterTotalAmount')}
          type="number"
          className="bg-gray-50"
        />
        <FormInput
          label={t('payment.paymentAmount')}
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder={t('payment.enterPaymentAmount')}
          type="number"
          className="bg-gray-50"
        />
        <FormInput
          label={t('payment.amountDue')}
          value={amountDue}
          onChange={(e) => setAmountDue(e.target.value)}
          placeholder={t('payment.enterAmountDue')}
          type="number"
          className="bg-gray-50"
        />
      </div>
    </ModalWrapper>
  )
}
