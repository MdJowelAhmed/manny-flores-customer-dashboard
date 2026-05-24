import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useGetSingleEstimateQuery } from '@/redux/api/estimateApi'
import { formatDateDayMonth } from '@/utils/formatters'
import {
  buildLineItemsFromEstimate,
  computeProjectTotals,
} from '@/pages/Projects/projectEstimateUtils'
import { COMPANY_INFO, fmtProjectMoney } from '@/pages/Projects/projectsData'
import { type Estimate } from '../estimatesData'

interface EstimateViewModalProps {
  open: boolean
  onClose: () => void
  estimate: Estimate | null
  onApprove?: (estimate: Estimate) => void
  onReject?: (estimate: Estimate) => void
  actionsDisabled?: boolean
}

function formatPreviewDateRange(start?: string, end?: string): string {
  const fmt = (iso?: string) => {
    if (!iso) return '—'
    const parsed = new Date(iso)
    if (Number.isNaN(parsed.getTime())) return iso
    return formatDateDayMonth(parsed)
  }
  return `${fmt(start)} — ${fmt(end)}`
}

export function EstimateViewModal({
  open,
  onClose,
  estimate,
  onApprove,
  onReject,
  actionsDisabled = false,
}: EstimateViewModalProps) {
  const { t } = useTranslation()

  const { data: estimateResponse, isLoading } = useGetSingleEstimateQuery(
    estimate?.id ?? '',
    { skip: !open || !estimate?.id }
  )

  const preview = useMemo(() => {
    if (!estimate) return null

    const doc = estimateResponse?.data
    const lineItems = doc ? buildLineItemsFromEstimate(doc) : []
    const taxPercent = doc?.taxNumber ?? estimate.taxRatePercent ?? 0
    const { balanceDue } = computeProjectTotals(
      lineItems,
      Number(taxPercent),
      doc?.totalCost
    )

    return {
      projectName: doc?.projectName ?? estimate.project,
      customerName: doc?.customerName ?? estimate.customerName,
      customerEmail: doc?.customerEmail ?? estimate.email ?? '—',
      customerAddress: doc?.customerAddress ?? estimate.company ?? '—',
      startDate: doc?.estimateStartDate,
      endDate: doc?.estimateEndDate,
      lineItems,
      totalCost: balanceDue,
    }
  }, [estimate, estimateResponse?.data])

  if (!estimate || !preview) return null

  const canRespond = estimate.status === 'Pending'

  const handleApprove = () => {
    onApprove?.(estimate)
    onClose()
  }

  const handleReject = () => {
    onReject?.(estimate)
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
        <div className="flex flex-col-reverse justify-end gap-3 px-6 pb-6 pt-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-[100px] rounded-lg border-gray-300 bg-white px-6 font-medium text-gray-800 shadow-sm hover:bg-gray-50"
            onClick={onClose}
          >
            {t('common.close', { defaultValue: 'Close' })}
          </Button>
          {canRespond ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-gray-300 bg-white px-6 font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                onClick={handleReject}
                disabled={actionsDisabled}
              >
                {t('estimates.reject')}
              </Button>
              <Button
                type="button"
                className="h-10 rounded-lg bg-[#22c55e] px-6 font-semibold text-white hover:bg-[#16a34a]"
                onClick={handleApprove}
                disabled={actionsDisabled}
              >
                {t('estimates.approved')}
              </Button>
            </>
          ) : null}
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
              {t('estimates.preparedFor', { defaultValue: 'Prepared for' })}
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
      </div>
    </ModalWrapper>
  )
}
