import { useEffect, useMemo, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fmtInvoiceUsd, getInvoiceBreakdown, type Invoice, type InvoiceStatus } from '../invoicesData'

interface InvoiceViewModalProps {
  open: boolean
  onClose: () => void
  invoice: Invoice
  onApprove?: (invoiceId: string, payload: { signatureDataUrl: string; approvedAt: string }) => void
}

function safeFormatDate(iso: string, fmt: string) {
  try {
    return format(parseISO(iso), fmt)
  } catch {
    return iso
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left transition-colors hover:bg-gray-100/80"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-gray-900">{title}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-500" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">{children}</div>
      ) : null}
    </div>
  )
}

function statusBadgeVariant(status: InvoiceStatus): 'warning' | 'success' | 'error' | 'secondary' {
  switch (status) {
    case 'paid':
      return 'success'
    case 'overdue':
      return 'error'
    case 'draft':
      return 'secondary'
    default:
      return 'warning'
  }
}

export function InvoiceViewModal({ open, onClose, invoice, onApprove }: InvoiceViewModalProps) {
  const { t } = useTranslation()

  const breakdown = getInvoiceBreakdown(invoice)
  const issueStr = safeFormatDate(invoice.invoiceDate, 'dd/MM/yyyy')
  const dueStr = invoice.dueDate ? safeFormatDate(invoice.dueDate, 'dd/MM/yyyy') : '—'
  const status = invoice.status ?? 'pending'

  const statusLabel = t(`invoice.status.${status}`)

  const isApproved = status === 'paid' && !!invoice.signatureDataUrl
  const canApprove = (status === 'pending' || status === 'overdue') && !isApproved && !!onApprove

  const approvedAtStr = useMemo(() => {
    if (!invoice.approvedAt) return ''
    return safeFormatDate(invoice.approvedAt, 'dd/MM/yyyy')
  }, [invoice.approvedAt])

  // Signature pad
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [sigDataUrl, setSigDataUrl] = useState<string>('')

  useEffect(() => {
    // Reset signature draft when switching invoices
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
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111827'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }

  useEffect(() => {
    if (!open) return
    resizeCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice.id])

  const getPoint = (e: PointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
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
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
    setSigDataUrl('')
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={invoice.refCode}
      size="xl"
      className="max-w-2xl bg-white sm:rounded-xl"
      headerClassName="pb-2"
    >
      <div className="space-y-5 rounded-xl bg-gray-100/80 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={statusBadgeVariant(status)} className="capitalize">
            {statusLabel}
          </Badge>
          <div className="text-sm text-gray-600">
            <span className="text-gray-500">{t('invoice.dueDate')}: </span>
            <span className="font-medium text-gray-900">{dueStr}</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {t('invoice.customerInfo')}
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900">{invoice.customerName}</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">{t('invoice.email')}</span>
              <span className="text-right font-medium text-gray-900">{invoice.customerEmail}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">{t('invoice.phone')}</span>
              <span className="text-right font-medium text-gray-900">{invoice.customerPhone}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">{t('invoice.address')}</span>
              <span className="max-w-[65%] text-right font-medium text-gray-900">
                {invoice.customerAddress}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-2">
              <span className="text-gray-500">{t('invoice.issueDate')}</span>
              <span className="font-medium text-gray-900">{issueStr}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">{t('invoice.reference')}</span>
              <span className="font-medium text-gray-900">{invoice.refCode}</span>
            </div>
          </div>
        </div>

        <CollapsibleSection title={t('invoice.labor')}>
          <Row label={t('invoice.quantity')} value={String(breakdown.labor.quantity)} />
          <Row label={t('invoice.price')} value={fmtInvoiceUsd(breakdown.labor.price)} />
        </CollapsibleSection>

        <CollapsibleSection title={t('invoice.material')}>
          <Row label={t('invoice.name')} value={breakdown.material.name} />
          <Row label={t('invoice.quantity')} value={String(breakdown.material.quantity)} />
          <Row
            label={t('invoice.unitPricePerSqFt')}
            value={fmtInvoiceUsd(breakdown.material.unitPricePerSqFt)}
          />
          <Row label={t('invoice.lineTotal')} value={fmtInvoiceUsd(breakdown.material.totalPrice)} />
        </CollapsibleSection>

        <CollapsibleSection title={t('invoice.equipment')}>
          <Row label={t('invoice.name')} value={breakdown.equipment.name} />
          <Row label={t('invoice.quantity')} value={String(breakdown.equipment.quantity)} />
          <Row
            label={t('invoice.unitPricePerSqFt')}
            value={fmtInvoiceUsd(breakdown.equipment.unitPricePerSqFt)}
          />
          <Row label={t('invoice.lineTotal')} value={fmtInvoiceUsd(breakdown.equipment.totalPrice)} />
        </CollapsibleSection>

        <CollapsibleSection title={t('invoice.priceSection')}>
          <Row label={t('invoice.subtotal')} value={fmtInvoiceUsd(breakdown.subtotal)} />
          {breakdown.discountAmount > 0 ? (
            <Row label={t('invoice.discount')} value={`−${fmtInvoiceUsd(breakdown.discountAmount)}`} />
          ) : null}
          <Row
            label={t('invoice.taxWithPercent', { percent: breakdown.taxPercent })}
            value={fmtInvoiceUsd(breakdown.taxAmount)}
          />
          <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-base font-semibold">
            <span className="text-gray-800">{t('invoice.grandTotal')}</span>
            <span className="text-[#22c55e]">{fmtInvoiceUsd(breakdown.grandTotal)}</span>
          </div>
        </CollapsibleSection>

        {invoice.description ? (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{t('invoice.notes')}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-900">{invoice.description}</p>
          </div>
        ) : null}

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-semibold text-gray-900">{t('invoice.signature')}</p>
            {isApproved ? (
              <span className="text-xs font-semibold text-green-700">
                {t('invoice.signedOn')} {approvedAtStr}
              </span>
            ) : null}
          </div>

          {isApproved && invoice.signatureDataUrl ? (
            <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <img
                src={invoice.signatureDataUrl}
                alt={t('invoice.signature')}
                className="h-24 w-full object-contain"
              />
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-500">{t('invoice.signatureHint')}</p>
              <div className="mt-3 rounded-lg border border-gray-200 bg-white">
                <canvas
                  ref={canvasRef}
                  className="h-28 w-full touch-none rounded-lg"
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
                  disabled={!sigDataUrl || !canApprove}
                  onClick={() => {
                    if (!sigDataUrl) return
                    const approvedAt = new Date().toISOString()
                    onApprove?.(invoice.id, { signatureDataUrl: sigDataUrl, approvedAt })
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
