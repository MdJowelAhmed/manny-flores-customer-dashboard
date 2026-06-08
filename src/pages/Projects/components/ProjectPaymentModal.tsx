import { useMemo } from 'react'
import type { Payment } from '@/pages/Payment/paymentsData'
import { AddPaymentModal } from '@/pages/Payment/components/AddPaymentModal'
import { useGetSingleEstimateQuery } from '@/redux/api/estimateApi'
import {
  buildLineItemsFromEstimate,
  computeProjectTotals,
} from '../projectEstimateUtils'
import { buildProjectPayablePayment } from '../projectPaymentUtils'
import type { Project } from '../projectsData'

interface ProjectPaymentModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
  onPaymentSuccess?: () => void
}

export function ProjectPaymentModal({
  open,
  onClose,
  project,
  onPaymentSuccess,
}: ProjectPaymentModalProps) {
  const estimateId = project?.estimateId ?? ''
  const { data: estimateResponse } = useGetSingleEstimateQuery(estimateId, {
    skip: !open || !estimateId,
  })

  const { payablePayments, payableInvoice, projectPaymentContext } = useMemo(() => {
    if (!project) {
      return {
        payablePayments: [] as Payment[],
        payableInvoice: undefined as string | undefined,
        projectPaymentContext: undefined,
      }
    }

    const estimate = estimateResponse?.data
    let due = 0
    if (estimate) {
      const lineItems = buildLineItemsFromEstimate(estimate)
      const { balanceDue } = computeProjectTotals(
        lineItems,
        Number(estimate.taxNumber ?? 0),
        estimate.totalCost
      )
      const estimateTotal = Number(estimate.totalCost ?? 0)
      due = balanceDue > 0 ? balanceDue : estimateTotal > 0 ? estimateTotal : 0
    }

    const payments = [buildProjectPayablePayment(project, due)]
    return {
      payablePayments: payments,
      payableInvoice: payments[0]?.invoice,
      projectPaymentContext: project.estimateId
        ? { estimateId: project.estimateId }
        : undefined,
    }
  }, [project, estimateResponse?.data])

  if (!project) return null

  return (
    <AddPaymentModal
      open={open}
      onClose={onClose}
      payments={payablePayments}
      onSubmit={() => {}}
      hideWireTransfer
      lockInvoice
      initialInvoice={payableInvoice}
      projectPayment={projectPaymentContext}
      onPaymentSuccess={() => {
        onClose()
        onPaymentSuccess?.()
      }}
    />
  )
}
