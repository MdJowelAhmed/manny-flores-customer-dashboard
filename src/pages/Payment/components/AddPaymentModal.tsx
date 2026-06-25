import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Banknote,
  Building2,
  CreditCard,
  FileImage,
} from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import {
  useCreateProjectPaymentMutation,
  type ProjectPaymentMethod,
} from '@/redux/api/projectApi'
import { CashReceiverPicker } from './CashReceiverPicker'
import type { Payment } from '../paymentsData'

export type CashPaidTo = 'admin' | 'employee'

export interface AddPaymentSubmitPayload {
  invoice: string
  amountPaid: number
  method: string
  note?: string
  cashPaidTo?: CashPaidTo
  employeeName?: string
  employeePhone?: string
  checkImageName?: string | null
  loanId?: string
  financeCompanyName?: string
}

type MethodKey = 'card' | 'check' | 'cash' | 'finance'
type SelectedMethodKey = MethodKey | null

const primaryMethodGreen = '#00B050'

export interface ProjectPaymentContext {
  estimateId: string
}

interface AddPaymentModalProps {
  open: boolean
  onClose: () => void
  /** Current invoices for the dropdown; payment is applied to the selected row */
  payments: Payment[]
  onSubmit: (data: AddPaymentSubmitPayload) => void
  /** Pre-select invoice and hide the invoice dropdown */
  lockInvoice?: boolean
  initialInvoice?: string
  /** POST /payment with estimateId (Projects flow) */
  projectPayment?: ProjectPaymentContext
  onPaymentSuccess?: () => void
}

function MethodCard({
  active,
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean
  icon: typeof CreditCard
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors',
        active
          ? 'border-transparent text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
      )}
      style={
        active
          ? { backgroundColor: primaryMethodGreen, borderColor: primaryMethodGreen }
          : undefined
      }
    >
      <Icon
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0',
          active ? 'text-white' : 'text-gray-600'
        )}
      />
      <div className="min-w-0">
        <div className="font-semibold leading-tight">{title}</div>
        <div
          className={cn(
            'mt-0.5 text-sm',
            active ? 'text-white/90' : 'text-gray-500'
          )}
        >
          {subtitle}
        </div>
      </div>
    </button>
  )
}

const inputClass =
  'h-11 rounded-lg border-0 bg-[#F3F4F6] shadow-none ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#00B050]/30'

function mergeNote(
  base: string,
  extras: { checkName?: string | null; employeeName?: string; employeePhone?: string }
): string | undefined {
  const parts: string[] = []
  const t = base.trim()
  if (t) parts.push(t)
  if (extras.checkName) parts.push(`Check image: ${extras.checkName}`)
  if (extras.employeeName && extras.employeePhone) {
    parts.push(`Employee: ${extras.employeeName.trim()}, ${extras.employeePhone.trim()}`)
  }
  return parts.length ? parts.join(' · ') : undefined
}

export function AddPaymentModal({
  open,
  onClose,
  payments,
  onSubmit,
  lockInvoice = false,
  initialInvoice,
  projectPayment,
  onPaymentSuccess,
}: AddPaymentModalProps) {
  const { t } = useTranslation()
  const checkInputRef = useRef<HTMLInputElement>(null)
  const [createProjectPayment, { isLoading: isSubmittingPayment }] =
    useCreateProjectPaymentMutation()
  const [invoice, setInvoice] = useState('')
  const [amountToPay, setAmountToPay] = useState('')
  const [note, setNote] = useState('')
  const [methodKey, setMethodKey] = useState<SelectedMethodKey>(null)
  const [checkFile, setCheckFile] = useState<File | null>(null)
  const [cashPaidTo, setCashPaidTo] = useState<CashPaidTo>('admin')
  const [employeeName, setEmployeeName] = useState('')
  const [employeePhone, setEmployeePhone] = useState('')
  const [cashReceiverId, setCashReceiverId] = useState('')
  const [loanId, setLoanId] = useState('')
  const [financeCompanyName, setFinanceCompanyName] = useState('')

  const payables = useMemo(
    () =>
      lockInvoice
        ? payments
        : payments.filter((p) => p.outstandingAmount > 0),
    [payments, lockInvoice]
  )

  const invoiceOptions = useMemo(
    () =>
      payables.map((p) => ({
        value: p.invoice,
        label: `${p.invoice} (${p.customer})`,
      })),
    [payables]
  )

  const cashRecipientOptions = useMemo(
    () => [
      { value: 'admin', label: t('payment.cashPaidToAdmin') },
      { value: 'employee', label: t('payment.cashPaidToEmployee') },
    ],
    [t]
  )

  const selectedPayment = useMemo(
    () => payables.find((p) => p.invoice === invoice),
    [payables, invoice]
  )

  const estimateIdForPayment = projectPayment?.estimateId ?? selectedPayment?.estimateId
  const isApiPayment = !!estimateIdForPayment

  useEffect(() => {
    if (!open || payables.length === 0) return
    const preferred =
      initialInvoice && payables.some((p) => p.invoice === initialInvoice)
        ? payables.find((p) => p.invoice === initialInvoice)!
        : payables[0]
    const first = preferred
    setInvoice(first.invoice)
    const suggested =
      first.outstandingAmount > 0
        ? String(Math.min(5000, first.outstandingAmount))
        : '0'
    setAmountToPay(suggested)
    setNote('')
    setMethodKey(null)
    setCheckFile(null)
    setCashPaidTo('admin')
    setEmployeeName('')
    setEmployeePhone('')
    setCashReceiverId('')
    setLoanId('')
    setFinanceCompanyName('')
    if (checkInputRef.current) checkInputRef.current.value = ''
  }, [open, payables, initialInvoice, isApiPayment])

  const handleClose = () => {
    onClose()
  }

  const parsedAmount = Number.parseFloat(amountToPay.replace(/,/g, '')) || 0

  const canCompletePayment = useMemo(() => {
    if (!methodKey) return false
    if (isApiPayment) {
      if (methodKey === 'card') return true
      if (methodKey === 'check') return !!checkFile && parsedAmount > 0
      if (methodKey === 'cash') return parsedAmount > 0 && !!cashReceiverId
      if (methodKey === 'finance') {
        return parsedAmount > 0 && !!loanId.trim() && !!financeCompanyName.trim()
      }
      return false
    }
    if (!invoice || !selectedPayment) return false
    if (parsedAmount <= 0) return false
    if (methodKey === 'check' && !checkFile) return false
    if (methodKey === 'cash' && cashPaidTo === 'employee') {
      return !!employeeName.trim() && !!employeePhone.trim()
    }
    if (methodKey === 'finance') {
      return !!loanId.trim() && !!financeCompanyName.trim()
    }
    return true
  }, [
    isApiPayment,
    methodKey,
    checkFile,
    parsedAmount,
    invoice,
    selectedPayment,
    cashPaidTo,
    employeeName,
    employeePhone,
    cashReceiverId,
    loanId,
    financeCompanyName,
  ])

  const submitApiPayment = async () => {
    if (!estimateIdForPayment || !methodKey) return

    const apiMethod: ProjectPaymentMethod =
      methodKey === 'card'
        ? 'CARD'
        : methodKey === 'check'
          ? 'CHEQUE'
          : methodKey === 'cash'
            ? 'CASH'
            : 'FINANCE'

    if (apiMethod === 'CHEQUE' && !checkFile) {
      toast.error(t('payment.checkImageRequired'))
      return
    }
    if (apiMethod !== 'CARD' && parsedAmount <= 0) {
      toast.error(t('payment.enterValidAmount'))
      return
    }
    if (apiMethod === 'CASH' && !cashReceiverId) {
      toast.error(
        t('payment.selectCashReceiver', {
          defaultValue: 'Select who received the cash',
        })
      )
      return
    }
    if (apiMethod === 'FINANCE') {
      if (!financeCompanyName.trim()) {
        toast.error(t('payment.financeCompanyNameRequired'))
        return
      }
      if (!loanId.trim()) {
        toast.error(t('payment.loanIdRequired'))
        return
      }
    }

    try {
      const result = await createProjectPayment({
        estimateId: estimateIdForPayment,
        method: apiMethod,
        amount: apiMethod === 'CARD' ? undefined : parsedAmount,
        receiverId: apiMethod === 'CASH' ? cashReceiverId : undefined,
        checkImage: apiMethod === 'CHEQUE' ? checkFile ?? undefined : undefined,
        loanId: apiMethod === 'FINANCE' ? loanId.trim() : undefined,
        financeCompanyName:
          apiMethod === 'FINANCE' ? financeCompanyName.trim() : undefined,
      }).unwrap()

      if (apiMethod === 'CARD') {
        const checkoutUrl = (result.data as { checkoutUrl?: string })?.checkoutUrl
        if (checkoutUrl) {
          window.location.href = checkoutUrl
          return
        }
        toast.error(
          t('payment.checkoutUrlMissing', {
            defaultValue: 'Checkout URL was not returned. Please try again.',
          })
        )
        return
      }

      toast.success(result.message || t('payment.paymentRecorded'))
      onPaymentSuccess?.()
      handleClose()
    } catch {
      toast.error(
        t('payment.paymentFailed', {
          defaultValue: 'Payment could not be processed. Please try again.',
        })
      )
    }
  }

  const handleComplete = async () => {
    const pay = parsedAmount
    if (isApiPayment) {
      await submitApiPayment()
      return
    }

    if (!invoice) {
      toast.error(t('payment.selectInvoice'))
      return
    }
    if (pay <= 0) {
      toast.error(t('payment.enterValidAmount'))
      return
    }
    if (!selectedPayment) {
      toast.error(t('payment.selectInvoice'))
      return
    }
    if (pay > selectedPayment.outstandingAmount + 0.01) {
      toast.error(t('payment.amountExceedsOutstanding'))
      return
    }

    if (methodKey === 'check' && !checkFile) {
      toast.error(t('payment.checkImageRequired'))
      return
    }

    if (methodKey === 'cash' && cashPaidTo === 'employee') {
      if (!employeeName.trim()) {
        toast.error(t('payment.employeeNameRequired'))
        return
      }
      if (!employeePhone.trim()) {
        toast.error(t('payment.employeePhoneRequired'))
        return
      }
    }
    if (methodKey === 'finance') {
      if (!financeCompanyName.trim()) {
        toast.error(t('payment.financeCompanyNameRequired'))
        return
      }
      if (!loanId.trim()) {
        toast.error(t('payment.loanIdRequired'))
        return
      }
    }

    const method =
      methodKey === 'cash'
        ? cashPaidTo === 'admin'
          ? t('payment.methodDisplayCashAdmin')
          : t('payment.methodDisplayCashEmployee')
        : methodKey === 'card'
          ? t('payment.methodDisplayCard')
          : methodKey === 'check'
            ? t('payment.methodDisplayCheck')
            : t('payment.methodDisplayFinance')
    const mergedNote = mergeNote(note, {
      checkName: methodKey === 'check' ? checkFile?.name ?? null : null,
      employeeName:
        methodKey === 'cash' && cashPaidTo === 'employee'
          ? employeeName
          : undefined,
      employeePhone:
        methodKey === 'cash' && cashPaidTo === 'employee'
          ? employeePhone
          : undefined,
    })

    onSubmit({
      invoice,
      amountPaid: pay,
      method,
      note: mergedNote,
      cashPaidTo: methodKey === 'cash' ? cashPaidTo : undefined,
      employeeName:
        methodKey === 'cash' && cashPaidTo === 'employee'
          ? employeeName.trim()
          : undefined,
      employeePhone:
        methodKey === 'cash' && cashPaidTo === 'employee'
          ? employeePhone.trim()
          : undefined,
      checkImageName: methodKey === 'check' ? checkFile?.name ?? null : null,
      loanId: methodKey === 'finance' ? loanId.trim() : undefined,
      financeCompanyName:
        methodKey === 'finance' ? financeCompanyName.trim() : undefined,
    })
    toast.success(t('payment.paymentRecorded'))
    handleClose()
  }

  const showAmountField =
    methodKey != null && !(isApiPayment && methodKey === 'card')

  const rightTitle =
    methodKey === null
      ? t('payment.selectPaymentMethodTitle', {
          defaultValue: 'Select payment method',
        })
      : methodKey === 'card'
        ? t('payment.cardStripeTitle')
        : methodKey === 'check'
          ? t('payment.checkPaymentTitle')
          : methodKey === 'cash'
            ? t('payment.cashPaymentTitle')
          : t('payment.financePaymentTitle')

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      title={t('payment.addPaymentTitle')}
      size="full"
      headerClassName="border-b border-gray-200 pb-4 mb-0 text-left"
      className="max-w-5xl w-[min(56rem,96vw)] gap-0 bg-white p-6 sm:rounded-xl"
    >
      {payments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('payment.noPayments')}
        </p>
      ) : payables.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('payment.noOutstandingInvoices')}
        </p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 pt-6">
          {/* Left: invoice, amount, note, methods */}
          <div className="space-y-6">
            {lockInvoice && selectedPayment ? (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-800">
                  {t('payment.invoiceNumber')}
                </Label>
                <p className={cn(inputClass, 'flex h-11 items-center px-3 text-sm text-gray-800')}>
                  {selectedPayment.invoice} ({selectedPayment.customer})
                </p>
              </div>
            ) : (
              <FormSelect
                label={t('payment.invoiceNumber')}
                value={invoice}
                options={invoiceOptions}
                onChange={setInvoice}
                placeholder={t('payment.chooseInvoice')}
                triggerClassName={cn(inputClass, 'h-11')}
              />
            )}

            {showAmountField ? (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-800">
                  {t('payment.amountToPay')}
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                    $
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={amountToPay}
                    onChange={(e) =>
                      setAmountToPay(e.target.value.replace(/[^\d.]/g, ''))
                    }
                    className={cn(inputClass, 'pl-8')}
                    placeholder="0"
                  />
                </div>
                {selectedPayment ? (
                  <p className="text-xs text-gray-500">
                    {t('payment.outstandingHint', {
                      amount: selectedPayment.outstandingAmount.toLocaleString(),
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-800">
                {t('payment.note')}
              </Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('payment.notePlaceholder')}
                className={cn(
                  'min-h-[100px] resize-none border-0 bg-[#F3F4F6] ring-1 ring-inset ring-gray-100 focus-visible:ring-2 focus-visible:ring-[#00B050]/30'
                )}
              />
            </div>

            <div className="space-y-3">
              <MethodCard
                active={methodKey === 'card'}
                icon={CreditCard}
                title={t('payment.methodCard')}
                subtitle={t('payment.methodCardSubStripe')}
                onClick={() => setMethodKey('card')}
              />
              <MethodCard
                active={methodKey === 'check'}
                icon={FileImage}
                title={t('payment.methodCheck')}
                subtitle={t('payment.methodCheckSub')}
                onClick={() => setMethodKey('check')}
              />
              <MethodCard
                active={methodKey === 'cash'}
                icon={Banknote}
                title={t('payment.methodCash')}
                subtitle={t('payment.methodCashSub')}
                onClick={() => setMethodKey('cash')}
              />
              <MethodCard
                active={methodKey === 'finance'}
                icon={Building2}
                title={t('payment.methodFinance')}
                subtitle={t('payment.methodFinanceSub')}
                onClick={() => setMethodKey('finance')}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-lg border-gray-200"
              onClick={handleClose}
            >
              {t('payment.cancel')}
            </Button>
          </div>

          {/* Right: method-specific form */}
          <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:min-h-[420px]">
            <h3 className="text-base font-semibold text-gray-900">
              {rightTitle}
            </h3>

            {methodKey === null ? (
              <p className="mt-6 flex-1 text-sm leading-relaxed text-gray-500">
                {t('payment.selectPaymentMethodHint', {
                  defaultValue:
                    'Choose Card, Check, Cash, or Finance Company on the left to continue with your payment.',
                })}
              </p>
            ) : methodKey === 'card' ? (
              <div className="mt-6 flex-1 space-y-4">
                <p className="text-sm leading-relaxed text-gray-600">
                  {t('payment.stripeCheckoutHint', {
                    defaultValue:
                      'You will be redirected to Stripe to enter your card details securely. Payment is recorded after a successful card payment.',
                  })}
                </p>
              </div>
            ) : methodKey === 'check' ? (
              <div className="mt-6 flex-1 space-y-4">
                <p className="text-sm text-gray-600">
                  {t('payment.checkUploadHint')}
                </p>
                <input
                  ref={checkInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  id="check-upload"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    setCheckFile(f)
                  }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg border-gray-200"
                    onClick={() => checkInputRef.current?.click()}
                  >
                    {t('payment.checkChooseFile')}
                  </Button>
                  {checkFile ? (
                    <span className="text-sm text-gray-700 truncate max-w-[220px]">
                      {checkFile.name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {t('payment.checkNoFile')}
                    </span>
                  )}
                </div>
              </div>
            ) : methodKey === 'cash' ? (
              <div className="mt-6 flex-1 space-y-4">
                <p className="text-sm text-gray-600">
                  {t('payment.cashIntro')}
                </p>
                {isApiPayment ? (
                  <CashReceiverPicker
                    value={cashReceiverId}
                    onChange={setCashReceiverId}
                    enabled={open && methodKey === 'cash'}
                  />
                ) : (
                  <>
                    <FormSelect
                      label={t('payment.cashPaidToLabel')}
                      value={cashPaidTo}
                      options={cashRecipientOptions}
                      onChange={(v) => {
                        setCashPaidTo(v as CashPaidTo)
                        if (v === 'admin') {
                          setEmployeeName('')
                          setEmployeePhone('')
                        }
                      }}
                      placeholder={t('common.select')}
                      triggerClassName={cn(inputClass, 'h-11')}
                    />
                    {cashPaidTo === 'employee' ? (
                      <div className="space-y-3 pt-1">
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-800">
                            {t('payment.employeeName')}
                          </Label>
                          <Input
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            placeholder={t('payment.employeeNamePlaceholder')}
                            className={inputClass}
                            autoComplete="name"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-800">
                            {t('payment.employeePhone')}
                          </Label>
                          <Input
                            value={employeePhone}
                            onChange={(e) => setEmployeePhone(e.target.value)}
                            placeholder={t('payment.employeePhonePlaceholder')}
                            className={inputClass}
                            type="tel"
                            autoComplete="tel"
                          />
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : methodKey === 'finance' ? (
              <div className="mt-6 flex-1 space-y-4">
                <p className="text-sm text-gray-600">
                  {t('payment.financeIntro')}
                </p>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-800">
                    {t('payment.financeCompanyName')}
                  </Label>
                  <Input
                    value={financeCompanyName}
                    onChange={(e) => setFinanceCompanyName(e.target.value)}
                    placeholder={t('payment.financeCompanyNamePlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-800">
                    {t('payment.loanId')}
                  </Label>
                  <Input
                    value={loanId}
                    onChange={(e) => setLoanId(e.target.value)}
                    placeholder={t('payment.loanIdPlaceholder')}
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-6 flex-1 text-sm leading-relaxed text-gray-600">
                {t('payment.alternateMethodHint')}
              </p>
            )}

            <div className="mt-auto pt-8">
              <Button
                type="button"
                className="h-12 w-full rounded-xl bg-[#00B050] text-base font-semibold text-white shadow-none hover:opacity-95 disabled:opacity-50"
                // style={{ backgroundColor: completeButtonGreen }}
                onClick={handleComplete}
                disabled={!canCompletePayment || isSubmittingPayment}
              >
                {isSubmittingPayment
                  ? t('common.processing', { defaultValue: 'Processing...' })
                  : t('payment.completePayment')}
              </Button>
              <p className="mt-4 text-center text-xs text-gray-500">
                {t('payment.paymentDisclaimer')}
              </p>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  )
}
