import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGetSingleEstimateQuery } from '@/redux/api/estimateApi'
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
import { type Estimate } from '../estimatesData'
import { EstimateDecisionSection } from './EstimateDecisionSection'

interface EstimateViewModalProps {
  open: boolean
  onClose: () => void
  estimate: Estimate | null
  onDecisionComplete?: () => void
}

export function EstimateViewModal({
  open,
  onClose,
  estimate,
  onDecisionComplete,
}: EstimateViewModalProps) {
  const { t } = useTranslation()

  const { data: estimateResponse, isLoading, refetch } = useGetSingleEstimateQuery(
    estimate?.id ?? '',
    { skip: !open || !estimate?.id }
  )

  const doc = estimateResponse?.data

  const preview = useMemo(() => {
    if (!estimate) return null

    const lineItems = doc ? buildLineItemsFromEstimate(doc) : []
    const taxPercent = doc?.taxNumber ?? estimate.taxRatePercent ?? 0
    const { balanceDue } = computeProjectTotals(
      lineItems,
      Number(taxPercent),
      doc?.totalCost
    )

    const totalDateRaw = doc?.totalDate ?? estimate.totalDate
    const totalDate =
      totalDateRaw != null && !Number.isNaN(Number(totalDateRaw))
        ? Number(totalDateRaw)
        : null

    const projectStatus = normalizeProjectInvoiceStatus(
      doc?.projectStatus ?? estimate.projectStatus
    )

    return {
      projectName: doc?.projectName ?? estimate.project,
      customerName: doc?.customerName ?? estimate.customerName,
      customerEmail: doc?.customerEmail ?? estimate.email ?? '',
      customerAddress: doc?.customerAddress ?? estimate.company ?? '—',
      lineItems,
      totalCost: balanceDue,
      totalDate: Number.isFinite(totalDate) ? totalDate : null,
      projectStatus,
      statusLabel: formatProjectInvoiceStatusLabel(projectStatus),
    }
  }, [estimate, estimateResponse?.data])

  if (!estimate || !preview) return null

  const showDecision = preview.projectStatus === 'PENDING' && !!preview.customerEmail

  const handleDecisionSuccess = () => {
    void refetch()
    onDecisionComplete?.()
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('estimates.previewTitle', { defaultValue: 'Estimate preview' })}
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
        <div className="grid  sm:grid-cols-2">
          <div className="space">
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                <img
                  src="/logo3.png"
                  alt={COMPANY_INFO.name}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold leading-tight text-gray-900">
                  {COMPANY_INFO.name}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">{COMPANY_INFO.tagline}</p>
              </div>
            </div>
            <div className="space-y-0.5 pl-[80px] text-xs leading-relaxed text-gray-500">
              <p>{COMPANY_INFO.address}</p>
              <p>
                {COMPANY_INFO.phone} · {COMPANY_INFO.email}
              </p>
            </div>
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              {t('estimates.preparedFor', { defaultValue: 'Prepared for' })}
            </p>
            <p className="text-base font-bold text-gray-900">{preview.customerName}</p>
            <p className="text-sm text-gray-500">{preview.customerEmail}</p>
            <p className="text-sm text-gray-500">{preview.customerAddress}</p>
            <p className="pt-2 text-sm text-gray-600">{preview.projectName}</p>

            {preview.totalDate != null ? (
              <div className="flex items-center justify-end gap-2 pt-1">
                <span className="text-xs font-medium text-gray-500">
                  {t('estimates.duration', { defaultValue: 'Duration' })}:
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {preview.totalDate}{' '}
                  {preview.totalDate === 1
                    ? t('estimates.day', { defaultValue: 'day' })
                    : t('estimates.days', { defaultValue: 'days' })}
                </span>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <span className="text-xs font-medium text-gray-500">
                {t('estimates.status', { defaultValue: 'Status' })}:
              </span>
              <Badge variant={projectInvoiceStatusBadgeVariant(preview.projectStatus)}>
                {preview.statusLabel}
              </Badge>
            </div>
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
                    {t('estimates.item', { defaultValue: 'Item' })}
                  </th>
                  <th className="px-5 py-3.5 text-center font-semibold">
                    {t('estimates.quantity', { defaultValue: 'Quantity' })}
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    {t('estimates.unitPrice', { defaultValue: 'Unit price' })}
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    {t('estimates.totalPrice', { defaultValue: 'Total Price' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {preview.lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                      {t('estimates.noLineItems', { defaultValue: 'No line items' })}
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
                  {t('estimates.totalCost', { defaultValue: 'Total cost' })}
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

        {showDecision ? (
          <EstimateDecisionSection
            estimateId={estimate.id}
            customerEmail={preview.customerEmail}
            customerName={preview.customerName}
            onSuccess={handleDecisionSuccess}
          />
        ) : null}
      </div>
    </ModalWrapper>
  )
}
