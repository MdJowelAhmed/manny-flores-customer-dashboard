import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Printer, Download } from 'lucide-react'
import { toast } from 'sonner'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { imageUrl } from '@/components/common/getImageUrl'
import {
  buildLineItemsFromEstimate,
  computeProjectTotals,
} from '@/pages/Projects/projectEstimateUtils'
import { COMPANY_INFO } from '@/pages/Projects/projectsData'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { type Invoice } from '../invoicesData'
import { generateInvoicePdf } from './generateInvoicePdf'

interface InvoiceViewModalProps {
  open: boolean
  onClose: () => void
  invoice: Invoice
  onAfterAction?: () => void
}

export function InvoiceViewModal({
  open,
  onClose,
  invoice,
  onAfterAction,
}: InvoiceViewModalProps) {
  const { t } = useTranslation()
  const estimate = (invoice.estimate as any) ?? undefined

  const preview = useMemo(() => {
    const doc = estimate
    const lineItems = doc ? buildLineItemsFromEstimate(doc) : []
    const taxPercent = doc?.taxNumber ?? invoice.taxPercent ?? 0
    const { subtotal, balanceDue } = computeProjectTotals(
      lineItems,
      Number(taxPercent),
      doc?.totalCost ?? invoice.subtotal ?? invoice.amount
    )

    const totalDateRaw = doc?.totalDate ?? invoice.totalDate
    const totalDate =
      totalDateRaw != null && !Number.isNaN(Number(totalDateRaw))
        ? Number(totalDateRaw)
        : null

    return {
      projectName: doc?.projectName ?? invoice.materialSummary,
      customerName: doc?.customerName ?? invoice.customerName,
      customerEmail: doc?.customerEmail ?? invoice.customerEmail ?? '—',
      customerAddress: doc?.customerAddress ?? invoice.customerAddress ?? '—',
      startDate: doc?.estimateStartDate ?? invoice.invoiceDate,
      endDate: doc?.estimateEndDate ?? invoice.dueDate,
      lineItems,
      subtotal,
      totalDue: balanceDue,
      totalDate,
    }
  }, [estimate, invoice])

  const signatureUrl = invoice.signatureDataUrl
  const isSigned = !!signatureUrl

  const printableRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const issuedLabel = useMemo(() => {
    const v = preview.startDate
    if (!v) return '—'
    try {
      return formatDate(v, 'MMMM d, yyyy')
    } catch {
      return String(v)
    }
  }, [preview.startDate])

  const dueLabel = useMemo(() => {
    const v = preview.endDate
    if (!v) return '—'
    try {
      return formatDate(v, 'MMMM d, yyyy')
    } catch {
      return String(v)
    }
  }, [preview.endDate])

  const fileName = `${(invoice.refCode ?? 'invoice').replace(/[^a-z0-9-]/gi, '')}.pdf`

  const runPdf = async (mode: 'print' | 'download') => {
    if (!printableRef.current) return
    const setBusy = mode === 'print' ? setIsPrinting : setIsDownloading
    setBusy(true)
    try {
      await generateInvoicePdf(printableRef.current, fileName, mode)
      onAfterAction?.()
    } catch {
      toast.error(
        t('invoice.pdfFailed', {
          defaultValue: 'Could not generate the PDF. Please try again.',
        })
      )
    } finally {
      setBusy(false)
    }
  }

  const formatQty = (n: number) =>
    Number.isInteger(n) ? String(n) : n.toLocaleString('en-US', { maximumFractionDigits: 2 })

  const unitSuffix = (category: string) => {
    const c = category.toLowerCase()
    if (c.includes('equipment')) return t('invoice.unitDay', { defaultValue: 'day' })
    return t('invoice.unitEach', { defaultValue: 'unit' })
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('invoice.previewTitle', { defaultValue: 'Estimate preview' })}
      size="full"
      className="max-w-4xl bg-white text-gray-900"
      headerClassName="px-6 pt-6 pb-0"
      footer={
        <div className="flex flex-wrap justify-end gap-2 px-6 pb-6 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPrinting || isDownloading}
          >
            {t('common.close', { defaultValue: 'Close' })}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => runPdf('print')}
            disabled={isPrinting || isDownloading}
          >
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            {t('invoice.print', { defaultValue: 'Print' })}
          </Button>
          <Button
            type="button"
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => runPdf('download')}
            disabled={isPrinting || isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t('invoice.downloadPdf', { defaultValue: 'Download PDF' })}
          </Button>
        </div>
      }
    >
      <div ref={printableRef} className="space-y-8 bg-white p-1 pb-2 text-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <img
              src="/image3.svg"
              alt={COMPANY_INFO.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div>
              <p className="text-xl font-bold">{COMPANY_INFO.name}</p>
              <p className="text-sm text-gray-500">{COMPANY_INFO.tagline}</p>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                {COMPANY_INFO.address}
                <br />
                {COMPANY_INFO.phone} · {COMPANY_INFO.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              {t('invoice.preparedFor', { defaultValue: 'Prepared for' })}
            </p>
            <p className="text-lg font-bold">{preview.customerName}</p>
            {preview.customerEmail && (
              <p className="text-sm text-gray-500">{preview.customerEmail}</p>
            )}
            {preview.customerAddress && (
              <p className="mt-1 text-sm text-gray-500 max-w-xs ml-auto">
                {preview.customerAddress}
              </p>
            )}
            {preview.projectName && (
              <p className="mt-2 text-sm font-medium text-gray-700">{preview.projectName}</p>
            )}
            <div className="mt-2 space-y-0.5 text-xs text-gray-500">
              <p>
                {t('invoice.issued', { defaultValue: 'Issued' })}:{' '}
                <span className="text-gray-700">{issuedLabel}</span>
              </p>
              <p>
                {t('invoice.dueDate', { defaultValue: 'Due Date' })}:{' '}
                <span className="text-gray-700">{dueLabel}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50/90 text-left text-gray-800">
                <th className="px-4 py-3 font-semibold first:rounded-tl-xl lg:pl-5">
                  {t('invoice.category', { defaultValue: 'Category' })}
                </th>
                <th className="px-4 py-3 font-semibold text-right w-[88px]">
                  {t('invoice.qty', { defaultValue: 'QTY' })}
                </th>
                <th className="px-4 py-3 font-semibold text-right min-w-[140px]">
                  {t('invoice.unitPrice', { defaultValue: 'Unit Price' })}
                </th>
                <th className="px-4 py-3 font-semibold text-right last:rounded-tr-xl lg:pr-5 min-w-[120px]">
                  {t('invoice.lineTotal', { defaultValue: 'Total' })}
                </th>
              </tr>
            </thead>
            <tbody>
              {(preview.lineItems ?? []).map((row: any, idx: number) => {
                const suffix = unitSuffix(row.name)
                return (
                  <tr key={`${row.name}-${idx}`} className="border-t border-gray-100 bg-white">
                    <td className="px-4 py-3.5 text-gray-800 lg:pl-5">{row.name}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-800">
                      {formatQty(Number(row.quantity ?? 0))}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-700">
                      {formatCurrency(Number(row.unitPrice ?? 0))} / {suffix}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-medium text-gray-900 lg:pr-5">
                      {formatCurrency(Number(row.totalPrice ?? 0))}
                    </td>
                  </tr>
                )
              })}
              {(preview.lineItems ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    {t('common.noDataFound', { defaultValue: 'No data found' })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 w-full max-w-sm flex flex-col justify-end">
            <div className="flex justify-between gap-4 text-sm text-gray-600 py-1">
              <span>{t('invoice.subtotal', { defaultValue: 'Subtotal' })}</span>
              <span className="tabular-nums text-gray-900">
                {formatCurrency(Number(preview.subtotal ?? 0))}
              </span>
            </div>
            <div className="my-3 border-t border-gray-200" />
            <div className="flex justify-between gap-4 items-baseline">
              <span className="font-bold text-gray-900">
                {t('invoice.totalDue', { defaultValue: 'Total Due' })}
              </span>
              <span className="text-xl font-bold text-primary tabular-nums">
                {formatCurrency(Number(preview.totalDue ?? 0))}
              </span>
            </div>
          </div>
        </div>

        {isSigned && signatureUrl ? (
          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-semibold text-gray-900 mb-4">
              {t('invoice.signaturesTitle', { defaultValue: 'Signatures' })}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <SignaturePreview
                label={t('invoice.customerSignature', { defaultValue: 'Customer Signature' })}
                src={imageUrl(signatureUrl)}
                emptyLabel={t('invoice.noSignatureYet', { defaultValue: 'No signature yet' })}
              />
              {invoice.approvedAt ? (
                <p className="md:col-span-2 text-xs text-gray-500">
                  {t('invoice.signedOn', { defaultValue: 'Signed on' })}{' '}
                  {new Date(invoice.approvedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </ModalWrapper>
  )
}

function SignaturePreview({
  label,
  src,
  emptyLabel,
}: {
  label: string
  src?: string | null
  emptyLabel: string
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 block">
        {label}
      </span>
      {src ? (
        <img
          src={src}
          alt={label}
          crossOrigin="anonymous"
          className="max-h-28 w-full rounded-lg border border-gray-200 bg-white object-contain p-2"
        />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/70 px-4 py-6 text-sm text-gray-500">
          {emptyLabel}
        </div>
      )}
    </div>
  )
}
