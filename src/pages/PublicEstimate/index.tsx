import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useGetPublicEstimateQuery,
  useSubmitPublicEstimateDecisionMutation,
} from '@/redux/api/invoiceApi'
import { imageUrl } from '@/components/common/getImageUrl'
import {
  buildLineItemsFromEstimate,
  computeProjectTotals,
} from '@/pages/Projects/projectEstimateUtils'
import { COMPANY_INFO, fmtProjectMoney } from '@/pages/Projects/projectsData'
import {
  formatProjectInvoiceStatusLabel,
  normalizeProjectInvoiceStatus,
  projectInvoiceStatusBadgeVariant,
} from '@/pages/Invoice/invoicesData'

type DecisionMode = 'idle' | 'approving' | 'rejecting'

function safeFormatSignedDate(iso?: string): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'dd/MM/yyyy')
  } catch {
    return iso
  }
}

export default function PublicEstimatePage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { data: estimateResponse, isLoading, isError, refetch } =
    useGetPublicEstimateQuery(id ?? '', {
      skip: !id,
    })
  const [submitDecision, { isLoading: isSubmitting }] =
    useSubmitPublicEstimateDecisionMutation()

  const doc = estimateResponse?.data

  const preview = useMemo(() => {
    const lineItems = doc ? buildLineItemsFromEstimate(doc) : []
    const taxPercent = doc?.taxNumber ?? 0
    const { balanceDue } = computeProjectTotals(
      lineItems,
      Number(taxPercent),
      doc?.totalCost ?? 0
    )

    return {
      projectName: doc?.projectName ?? '',
      customerName: doc?.customerName ?? '',
      customerEmail: doc?.customerEmail ?? '—',
      customerAddress: doc?.customerAddress ?? '—',
      startDate: doc?.estimateStartDate,
      endDate: doc?.estimateEndDate,
      lineItems,
      totalCost: balanceDue,
    }
  }, [doc])

  const projectStatus = normalizeProjectInvoiceStatus(doc?.projectStatus)
  const statusLabel = formatProjectInvoiceStatusLabel(projectStatus)
  const totalDateRaw =
    (doc as { totalDate?: number | string | null } | undefined)?.totalDate
  const totalDate =
    typeof totalDateRaw === 'number'
      ? totalDateRaw
      : typeof totalDateRaw === 'string' && totalDateRaw.trim() !== ''
      ? Number(totalDateRaw)
      : null

  const signatureUrl =
    (doc as { customerSignature?: string | null } | undefined)?.customerSignature ??
    undefined
  const isApproved =
    !!signatureUrl ||
    projectStatus === 'IN_PROGRESS' ||
    projectStatus === 'COMPLETED'
  const isRejected = projectStatus === 'CANCELLED'
  const isPending = projectStatus === 'PENDING'
  const showDecisionSection = isPending && !isApproved && !isRejected

  const [mode, setMode] = useState<DecisionMode>('idle')

  const approvedAtIso = doc?.updatedAt
  const approvedAtStr = useMemo(
    () => (isApproved ? safeFormatSignedDate(approvedAtIso) : ''),
    [isApproved, approvedAtIso]
  )

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [sigDataUrl, setSigDataUrl] = useState('')

  useEffect(() => {
    setSigDataUrl('')
    setMode('idle')
  }, [id])

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
    if (mode !== 'approving') return
    resizeCanvas()
    const onResize = () => resizeCanvas()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mode])

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

  const handleApprove = async () => {
    if (!sigDataUrl || !id || !doc) return
    try {
      await submitDecision({
        estimateId: id,
        estimateStatus: 'APPROVED',
        customerEmail: doc.customerEmail,
        customerName: doc.customerName,
        signatureDataUrl: sigDataUrl,
      }).unwrap()
      await refetch()
      toast.success(
        t('invoice.approveSuccess', {
          defaultValue: 'Estimate approved successfully',
        })
      )
      setMode('idle')
    } catch {
      toast.error(
        t('invoice.approveError', {
          defaultValue: 'Failed to approve estimate',
        })
      )
    }
  }

  const handleReject = async () => {
    if (!id || !doc) return
    try {
      await submitDecision({
        estimateId: id,
        estimateStatus: 'REJECTED',
        customerEmail: doc.customerEmail,
        customerName: doc.customerName,
      }).unwrap()
      await refetch()
      toast.success(
        t('invoice.rejectSuccess', {
          defaultValue: 'Estimate rejected',
        })
      )
      setMode('idle')
    } catch {
      toast.error(
        t('invoice.rejectError', {
          defaultValue: 'Failed to reject estimate',
        })
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
          <div className="px-6 pt-6 pb-0">
            <h1 className="text-xl font-semibold text-gray-900">
              {t('invoice.previewTitle', { defaultValue: 'Estimate preview' })}
            </h1>
          </div>

          {!id ? (
            <div className="px-6 py-16 text-center text-sm text-red-600">
              {t('invoice.invalidLink', {
                defaultValue: 'Invalid estimate link.',
              })}
            </div>
          ) : isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-500">
              {t('common.loading', { defaultValue: 'Loading...' })}
            </div>
          ) : isError || !doc ? (
            <div className="px-6 py-16 text-center text-sm text-red-600">
              {t('invoice.loadError', {
                defaultValue: 'Failed to load estimate',
              })}
            </div>
          ) : (
            <div className="space-y-6 px-6 pb-6 pt-4">
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                      <img
                        src="/image3.svg"
                        alt={COMPANY_INFO.name}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold leading-tight text-gray-900">
                        {COMPANY_INFO.name}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {COMPANY_INFO.tagline}
                      </p>
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
                  <p className="text-base font-bold text-gray-900">
                    {preview.customerName}
                  </p>
                  <p className="text-sm text-gray-500">{preview.customerEmail}</p>
                  <p className="text-sm text-gray-500">{preview.customerAddress}</p>
                  <p className="pt-2 text-sm text-gray-600">{preview.projectName}</p>

                  {totalDate != null ? (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <span className="text-xs font-medium text-gray-500">
                        {t('invoice.duration', { defaultValue: 'Duration' })}:
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {totalDate}{' '}
                        {totalDate === 1
                          ? t('invoice.day', { defaultValue: 'day' })
                          : t('invoice.days', { defaultValue: 'days' })}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-2 pt-2">
                   
                    <Badge variant={projectInvoiceStatusBadgeVariant(projectStatus)}>
                      {statusLabel}
                    </Badge>
                  </div>
                </div>
              </div>

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
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-gray-500"
                        >
                          {t('invoice.noLineItems', {
                            defaultValue: 'No line items',
                          })}
                        </td>
                      </tr>
                    ) : (
                      preview.lineItems.map((row, index) => (
                        <tr
                          key={`${row.name}-${index}`}
                          className="border-t border-gray-100"
                        >
                          <td className="px-5 py-3.5 font-medium text-gray-900">
                            {row.name}
                          </td>
                          <td className="px-5 py-3.5 text-center text-gray-700">
                            {row.quantity}
                          </td>
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

              {isApproved ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      {t('invoice.approvedTitle', {
                        defaultValue: 'Estimate approved',
                      })}
                    </p>
                    {approvedAtStr ? (
                      <span className="text-xs font-medium text-green-700">
                        {t('invoice.signedOn', { defaultValue: 'Signed on' })}{' '}
                        {approvedAtStr}
                      </span>
                    ) : null}
                  </div>
                  {signatureUrl ? (
                    <div className="mt-3 rounded-lg border border-green-200 bg-white p-4">
                      <img
                        src={imageUrl(signatureUrl)}
                        alt={t('invoice.signature', {
                          defaultValue: 'Digital Signature',
                        })}
                        className="mx-auto max-h-28 w-full object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              ) : isRejected ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-800">
                    <XCircle className="h-4 w-4" />
                    {t('invoice.rejectedTitle', {
                      defaultValue: 'Estimate rejected',
                    })}
                  </p>
                </div>
              ) : showDecisionSection ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  {mode === 'idle' ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900">
                        {t('invoice.reviewDecisionTitle', {
                          defaultValue: 'Review your decision',
                        })}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {t('invoice.reviewDecisionHint', {
                          defaultValue:
                            'Approve this estimate with your signature, or reject it if you do not agree.',
                        })}
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 rounded-lg border-red-200 bg-white px-6 font-semibold text-red-600 hover:bg-red-50"
                          onClick={() => setMode('rejecting')}
                          disabled={isSubmitting}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {t('invoice.rejectEstimate', {
                            defaultValue: 'Reject',
                          })}
                        </Button>
                        <Button
                          type="button"
                          className="h-10 rounded-lg bg-[#22c55e] px-6 font-semibold text-white hover:bg-[#16a34a]"
                          onClick={() => setMode('approving')}
                          disabled={isSubmitting}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {t('invoice.approveEstimate', {
                            defaultValue: 'Approve',
                          })}
                        </Button>
                      </div>
                    </>
                  ) : mode === 'approving' ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {t('invoice.signature', {
                            defaultValue: 'Digital Signature',
                          })}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {t('invoice.signatureHint', {
                          defaultValue:
                            'Draw your signature below to approve this estimate.',
                        })}
                      </p>
                      <div className="mt-3 rounded-lg border border-gray-200 bg-white">
                        <canvas
                          ref={canvasRef}
                          className="block h-28 w-full touch-none rounded-lg"
                          onPointerDown={beginDraw}
                          onPointerMove={draw}
                          onPointerUp={endDraw}
                          onPointerCancel={endDraw}
                          aria-label={t('invoice.signature', {
                            defaultValue: 'Digital Signature',
                          })}
                        />
                      </div>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                          onClick={clearSignature}
                          disabled={isSubmitting}
                        >
                          {t('invoice.clearSignature', {
                            defaultValue: 'Clear',
                          })}
                        </Button>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 rounded-lg text-gray-600"
                            onClick={() => {
                              setMode('idle')
                              clearSignature()
                            }}
                            disabled={isSubmitting}
                          >
                            {t('common.cancel', { defaultValue: 'Cancel' })}
                          </Button>
                          <Button
                            type="button"
                            className="h-10 rounded-lg bg-[#22c55e] px-6 font-semibold text-white hover:bg-[#16a34a]"
                            disabled={!sigDataUrl || isSubmitting}
                            onClick={handleApprove}
                          >
                            {isSubmitting
                              ? t('common.submitting', {
                                  defaultValue: 'Submitting...',
                                })
                              : t('invoice.approveInvoice', {
                                  defaultValue: 'Approve Estimate',
                                })}
                          </Button>
                        </div>
                      </div>
                      {!sigDataUrl ? (
                        <p className="mt-2 text-xs text-gray-500">
                          {t('invoice.signatureRequired', {
                            defaultValue: 'Signature is required to approve.',
                          })}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900">
                        {t('invoice.rejectConfirmTitle', {
                          defaultValue: 'Reject this estimate?',
                        })}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {t('invoice.rejectConfirmHint', {
                          defaultValue:
                            'You don’t need to sign to reject. This action cannot be undone.',
                        })}
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-10 rounded-lg text-gray-600"
                          onClick={() => setMode('idle')}
                          disabled={isSubmitting}
                        >
                          {t('common.cancel', { defaultValue: 'Cancel' })}
                        </Button>
                        <Button
                          type="button"
                          className="h-10 rounded-lg bg-red-600 px-6 font-semibold text-white hover:bg-red-700"
                          onClick={handleReject}
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? t('common.submitting', {
                                defaultValue: 'Submitting...',
                              })
                            : t('invoice.confirmReject', {
                                defaultValue: 'Yes, reject',
                              })}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {COMPANY_INFO.name}.{' '}
          {t('common.allRightsReserved', { defaultValue: 'All rights reserved.' })}
        </p>
      </main>
    </div>
  )
}
