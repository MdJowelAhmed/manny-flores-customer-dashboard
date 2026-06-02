import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubmitPublicEstimateDecisionMutation } from '@/redux/api/invoiceApi'

type DecisionMode = 'idle' | 'approving' | 'rejecting'

interface EstimateDecisionSectionProps {
  estimateId: string
  customerEmail: string
  customerName: string
  onSuccess?: () => void
}

export function EstimateDecisionSection({
  estimateId,
  customerEmail,
  customerName,
  onSuccess,
}: EstimateDecisionSectionProps) {
  const { t } = useTranslation()
  const [submitDecision, { isLoading: isSubmitting }] =
    useSubmitPublicEstimateDecisionMutation()

  const [mode, setMode] = useState<DecisionMode>('idle')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const [sigDataUrl, setSigDataUrl] = useState('')

  useEffect(() => {
    setSigDataUrl('')
    setMode('idle')
  }, [estimateId])

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
    if (!sigDataUrl) return
    try {
      await submitDecision({
        estimateId,
        estimateStatus: 'APPROVED',
        customerEmail,
        customerName,
        signatureDataUrl: sigDataUrl,
      }).unwrap()
      toast.success(
        t('invoice.approveSuccess', {
          defaultValue: 'Estimate approved successfully',
        })
      )
      setMode('idle')
      onSuccess?.()
    } catch {
      toast.error(
        t('invoice.approveError', {
          defaultValue: 'Failed to approve estimate',
        })
      )
    }
  }

  const handleReject = async () => {
    try {
      await submitDecision({
        estimateId,
        estimateStatus: 'REJECTED',
        customerEmail,
        customerName,
      }).unwrap()
      toast.success(
        t('invoice.rejectSuccess', {
          defaultValue: 'Estimate rejected',
        })
      )
      setMode('idle')
      onSuccess?.()
    } catch {
      toast.error(
        t('invoice.rejectError', {
          defaultValue: 'Failed to reject estimate',
        })
      )
    }
  }

  return (
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
              {t('invoice.rejectEstimate', { defaultValue: 'Reject' })}
            </Button>
            <Button
              type="button"
              className="h-10 rounded-lg bg-[#22c55e] px-6 font-semibold text-white hover:bg-[#16a34a]"
              onClick={() => setMode('approving')}
              disabled={isSubmitting}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t('invoice.approveEstimate', { defaultValue: 'Approve' })}
            </Button>
          </div>
        </>
      ) : mode === 'approving' ? (
        <>
          <p className="text-sm font-semibold text-gray-900">
            {t('invoice.signature', { defaultValue: 'Digital Signature' })}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t('invoice.signatureHint', {
              defaultValue: 'Draw your signature below to approve this estimate.',
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
              aria-label={t('invoice.signature', { defaultValue: 'Digital Signature' })}
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
              {t('invoice.clearSignature', { defaultValue: 'Clear' })}
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
                  ? t('common.submitting', { defaultValue: 'Submitting...' })
                  : t('invoice.approveInvoice', { defaultValue: 'Approve Estimate' })}
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
                ? t('common.submitting', { defaultValue: 'Submitting...' })
                : t('invoice.confirmReject', { defaultValue: 'Yes, reject' })}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
