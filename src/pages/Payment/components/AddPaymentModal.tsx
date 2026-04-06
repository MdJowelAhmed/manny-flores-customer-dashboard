import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  CreditCard,
  Hand,
  Smartphone,
} from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import type { Payment } from '../paymentsData'

export interface AddPaymentSubmitPayload {
  invoice: string
  amountPaid: number
  method: string
}

type MethodKey = 'card' | 'wire' | 'cashapp' | 'tap'

const METHOD_MAP: Record<MethodKey, string> = {
  card: 'Card',
  wire: 'Bank Transfer',
  cashapp: 'Cash App / Links',
  tap: 'Tap to Pay',
}

const primaryMethodGreen = '#00B050'
const completeButtonGreen = '#66D87D'

interface AddPaymentModalProps {
  open: boolean
  onClose: () => void
  /** Current invoices for the dropdown; payment is applied to the selected row */
  payments: Payment[]
  onSubmit: (data: AddPaymentSubmitPayload) => void
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

export function AddPaymentModal({
  open,
  onClose,
  payments,
  onSubmit,
}: AddPaymentModalProps) {
  const { t } = useTranslation()
  const [invoice, setInvoice] = useState('')
  const [amountToPay, setAmountToPay] = useState('')
  const [note, setNote] = useState('')
  const [methodKey, setMethodKey] = useState<MethodKey>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  const payables = useMemo(
    () => payments.filter((p) => p.outstandingAmount > 0),
    [payments]
  )

  const invoiceOptions = useMemo(
    () =>
      payables.map((p) => ({
        value: p.invoice,
        label: `${p.invoice} (${p.customer})`,
      })),
    [payables]
  )

  const selectedPayment = useMemo(
    () => payables.find((p) => p.invoice === invoice),
    [payables, invoice]
  )

  useEffect(() => {
    if (!open || payables.length === 0) return
    const first = payables[0]
    setInvoice(first.invoice)
    const suggested =
      first.outstandingAmount > 0
        ? String(Math.min(5000, first.outstandingAmount))
        : '0'
    setAmountToPay(suggested)
    setNote('')
    setMethodKey('card')
    setCardNumber('')
    setExpiry('')
    setCvc('')
  }, [open, payables])

  const handleClose = () => {
    onClose()
  }

  const handleComplete = () => {
    const pay = Number.parseFloat(amountToPay.replace(/,/g, '')) || 0
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

    onSubmit({
      invoice,
      amountPaid: pay,
      method: METHOD_MAP[methodKey],
    })
    toast.success(t('payment.paymentRecorded'))
    handleClose()
  }

  const rightTitle =
    methodKey === 'card'
      ? t('payment.cardPaymentInfo')
      : methodKey === 'wire'
        ? t('payment.wireTransferInfo')
        : methodKey === 'cashapp'
          ? t('payment.cashAppInfo')
          : t('payment.tapToPayInfo')

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
            <FormSelect
              label={t('payment.invoiceNumber')}
              value={invoice}
              options={invoiceOptions}
              onChange={setInvoice}
              placeholder={t('payment.chooseInvoice')}
              triggerClassName={cn(inputClass, 'h-11')}
            />

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
                subtitle={t('payment.methodCardSub')}
                onClick={() => setMethodKey('card')}
              />
              <MethodCard
                active={methodKey === 'wire'}
                icon={ArrowLeftRight}
                title={t('payment.methodWire')}
                subtitle={t('payment.methodWireSub')}
                onClick={() => setMethodKey('wire')}
              />
              <MethodCard
                active={methodKey === 'cashapp'}
                icon={Smartphone}
                title={t('payment.methodCashApp')}
                subtitle={t('payment.methodCashAppSub')}
                onClick={() => setMethodKey('cashapp')}
              />
              <MethodCard
                active={methodKey === 'tap'}
                icon={Hand}
                title={t('payment.methodTap')}
                subtitle={t('payment.methodTapSub')}
                onClick={() => setMethodKey('tap')}
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

            {methodKey === 'card' ? (
              <>
                <p className="mt-6 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t('payment.enterCardDetails')}
                </p>
                <div className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="sr-only">{t('payment.cardNumber')}</Label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder={t('payment.cardNumber')}
                      className={inputClass}
                      autoComplete="cc-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="sr-only">{t('payment.expiry')}</Label>
                      <Input
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder={t('payment.expiry')}
                        className={inputClass}
                        autoComplete="cc-exp"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="sr-only">{t('payment.cvc')}</Label>
                      <Input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder={t('payment.cvc')}
                        className={inputClass}
                        autoComplete="cc-csc"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-6 flex-1 text-sm leading-relaxed text-gray-600">
                {t('payment.alternateMethodHint')}
              </p>
            )}

            <div className="mt-auto pt-8">
              <Button
                type="button"
                className="h-12 w-full rounded-xl text-base font-semibold text-white shadow-none hover:opacity-95"
                style={{ backgroundColor: completeButtonGreen }}
                onClick={handleComplete}
              >
                {t('payment.completePayment')}
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
