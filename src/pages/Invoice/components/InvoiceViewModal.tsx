import { useEffect, useMemo, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useGetSingleEstimateQuery } from '@/redux/api/estimateApi'
import { imageUrl } from '@/components/common/getImageUrl'
import { formatDateDayMonth } from '@/utils/formatters'
import {
  buildLineItemsFromEstimate,
  computeProjectTotals,
} from '@/pages/Projects/projectEstimateUtils'
import { COMPANY_INFO, fmtProjectMoney } from '@/pages/Projects/projectsData'
import { type Invoice } from '../invoicesData'

interface InvoiceViewModalProps {
  open: boolean
  onClose: () => void
  invoice: Invoice
  onApprove?: (
    invoiceId: string,
    payload: { signatureDataUrl: string; approvedAt: string }
  ) => void | Promise<void>
  isSubmittingSignature?: boolean
}

function formatPreviewDateRange(start?: string, end?: string): string {
  const fmt = (iso?: string) => {
    if (!iso) return '—'
    try {
      const parsed = iso.includes('T') ? new Date(iso) : parseISO(iso)
      if (Number.isNaN(parsed.getTime())) return iso
      return formatDateDayMonth(parsed)
    } catch {
      return iso
    }
  }
  return `${fmt(start)} — ${fmt(end)}`
}

function safeFormatSignedDate(iso?: string): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'dd/MM/yyyy')
  } catch {
    return iso
  }
}

export function InvoiceViewModal({
  open,
  onClose,
  invoice,
  onApprove,
  isSubmittingSignature = false,
}: InvoiceViewModalProps) {
  const { t } = useTranslation()

  const { data: estimateResponse, isLoading } = useGetSingleEstimateQuery(invoice.id, {
    skip: !open || !invoice.id,
  })

  const preview = useMemo(() => {
    const doc = estimateResponse?.data
    const lineItems = doc ? buildLineItemsFromEstimate(doc) : []
    const taxPercent = doc?.taxNumber ?? invoice.taxPercent ?? 0
    const { balanceDue } = computeProjectTotals(
      lineItems,
      Number(taxPercent),
      doc?.totalCost ?? invoice.amount
    )

    return {
      projectName: doc?.projectName ?? invoice.materialSummary,
      customerName: doc?.customerName ?? invoice.customerName,
      customerEmail: doc?.customerEmail ?? invoice.customerEmail ?? '—',
      customerAddress: doc?.customerAddress ?? invoice.customerAddress ?? '—',
      startDate: doc?.estimateStartDate ?? invoice.invoiceDate,
      endDate: doc?.estimateEndDate ?? invoice.dueDate,
      lineItems,
      totalCost: balanceDue,
    }
  }, [estimateResponse?.data, invoice])

  const status = invoice.status ?? 'pending'
  const isApproved = status === 'paid' && !!invoice.signatureDataUrl
  const canApprove =
    (status === 'pending' || status === 'overdue') && !isApproved && !!onApprove

  const approvedAtStr = useMemo(
    () => safeFormatSignedDate(invoice.approvedAt),
    [invoice.approvedAt]
  )

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [sigDataUrl, setSigDataUrl] = useState('')

  useEffect(() => {
    setSigDataUrl('')
  }, [invoice.id])

  const hasSignature = !!sigDataUrl || !!invoice.signatureDataUrl

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const nextW = Math.max(1, Math.floor(rect.width * dpr))
    const nextH = Math.max(1, Math.floor(rect.height * dpr))
    if (canvas.width === nextW && canvas.height === nextH) return
    canvas.width = nextW
    canvas.height = nextH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.lineWidth = 2.2 * dpr
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111827'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    if (!open) return
    resizeCanvas()
    const onResize = () => resizeCanvas()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice.id])

  const getPoint = (e: PointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / Math.max(1, rect.width)
    const scaleY = canvas.height / Math.max(1, rect.height)
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const beginDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawingRef.current = true
    canvas.setPointerCapture(e.pointerId)
    const p = getPoint(e.nativeEvent, canvas)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const p = getPoint(e.nativeEvent, canvas)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const endDraw = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      setSigDataUrl(canvas.toDataURL('image/png'))
    } catch {
      // ignore
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setSigDataUrl('')
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('invoice.previewTitle', { defaultValue: 'Estimate preview' })}
      size="full"
      className="max-w-4xl border-0 bg-white p-0 shadow-xl sm:rounded-2xl"
      headerClassName="px-6 pt-6 pb-0"
      footer={
        <div className="flex justify-end px-6 pb-6 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-[100px] rounded-lg border-gray-300 bg-white px-6 font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            onClick={onClose}
          >
            {t('common.close', { defaultValue: 'Close' })}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 px-6 pb-2">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#22c55e] text-xs font-bold text-white">
                MF
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold leading-tight text-gray-900">
                  {COMPANY_INFO.name}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">{COMPANY_INFO.tagline}</p>
              </div>
            </div>
            <div className="space-y-0.5 pl-[52px] text-xs leading-relaxed text-gray-500">
              <p>{COMPANY_INFO.address}</p>
              <p>
                {COMPANY_INFO.phone} · {COMPANY_INFO.email}
              </p>
            </div>
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              {t('invoice.preparedFor', { defaultValue: 'Prepared for' })}
            </p>
            <p className="text-base font-bold text-gray-900">{preview.customerName}</p>
            <p className="text-sm text-gray-500">{preview.customerEmail}</p>
            <p className="text-sm text-gray-500">{preview.customerAddress}</p>
            <p className="pt-2 text-sm text-gray-600">{preview.projectName}</p>
            <p className="text-sm text-gray-500">
              {formatPreviewDateRange(preview.startDate, preview.endDate)}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-500">
            {t('common.loading', { defaultValue: 'Loading...' })}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#ecfdf3] text-left text-xs font-semibold text-gray-700">
                  <th className="px-5 py-3.5 font-semibold">
                    {t('invoice.item', { defaultValue: 'Item' })}
                  </th>
                  <th className="px-5 py-3.5 text-center font-semibold">
                    {t('invoice.quantity', { defaultValue: 'Quantity' })}
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    {t('invoice.unitPrice', { defaultValue: 'Unit price' })}
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    {t('invoice.totalPrice', { defaultValue: 'Total Price' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {preview.lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                      {t('invoice.noLineItems', { defaultValue: 'No line items' })}
                    </td>
                  </tr>
                ) : (
                  preview.lineItems.map((row, index) => (
                    <tr key={`${row.name}-${index}`} className="border-t border-gray-100">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{row.name}</td>
                      <td className="px-5 py-3.5 text-center text-gray-700">{row.quantity}</td>
                      <td className="px-5 py-3.5 text-right text-gray-700">
                        {fmtProjectMoney(row.unitPrice)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                        {fmtProjectMoney(row.totalPrice)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="grid grid-cols-4 border-t border-gray-200 bg-white">
              <div className="col-span-2" />
              <div className="flex items-center px-5 py-4">
                <span className="text-sm font-bold text-gray-900">
                  {t('invoice.totalCost', { defaultValue: 'Total cost' })}
                </span>
              </div>
              <div className="flex items-center justify-end px-5 py-4">
                <span className="text-base font-bold text-[#22c55e]">
                  {fmtProjectMoney(preview.totalCost)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Signature — same functionality as before */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">{t('invoice.signature')}</p>
            {isApproved ? (
              <span className="text-xs font-semibold text-green-700">
                {t('invoice.signedOn')} {approvedAtStr}
              </span>
            ) : null}
          </div>

          {isApproved && invoice.signatureDataUrl ? (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <img
                src={imageUrl(invoice.signatureDataUrl)}
                alt={t('invoice.signature')}
                className="mx-auto max-h-28 w-full object-contain"
              />
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-500">{t('invoice.signatureHint')}</p>
              <div className="mt-3 rounded-lg border border-gray-200 bg-white">
                <canvas
                  ref={canvasRef}
                  className="block h-28 w-full touch-none rounded-lg"
                  onPointerDown={beginDraw}
                  onPointerMove={draw}
                  onPointerUp={endDraw}
                  onPointerCancel={endDraw}
                  aria-label={t('invoice.signature')}
                />
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={clearSignature}
                >
                  {t('invoice.clearSignature')}
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-lg bg-[#22c55e] px-6 font-semibold text-white hover:bg-[#16a34a]"
                  disabled={!sigDataUrl || !canApprove || isSubmittingSignature}
                  onClick={() => {
                    if (!sigDataUrl) return
                    const approvedAt = new Date().toISOString()
                    void onApprove?.(invoice.id, {
                      signatureDataUrl: sigDataUrl,
                      approvedAt,
                    })
                  }}
                >
                  {t('invoice.approveInvoice')}
                </Button>
              </div>
              {!canApprove ? (
                <p className="mt-2 text-xs text-gray-500">{t('invoice.approveLocked')}</p>
              ) : null}
              {canApprove && !hasSignature ? (
                <p className="mt-2 text-xs text-gray-500">{t('invoice.signatureRequired')}</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </ModalWrapper>
  )
}
