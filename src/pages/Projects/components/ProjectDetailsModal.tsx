import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ConfirmDialog, ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { useGetSingleEstimateQuery } from '@/redux/api/estimateApi'
import { useCompleteProjectMutation } from '@/redux/api/projectApi'
import { formatDateDayMonth } from '@/utils/formatters'
import {
  buildLineItemsFromEstimate,
  computeProjectTotals,
} from '../projectEstimateUtils'
import {
  COMPANY_INFO,
  fmtProjectMoney,
  type Project,
} from '../projectsData'
import { imageUrl } from '@/components/common/getImageUrl'

interface ProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
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

export function ProjectDetailsModal({ open, onClose, project }: ProjectDetailsModalProps) {
  const { t } = useTranslation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [completeProject, { isLoading: isCompleting }] = useCompleteProjectMutation()

  const estimateId = project?.estimateId ?? ''
  const { data: estimateResponse, isLoading: isEstimateLoading } = useGetSingleEstimateQuery(
    estimateId,
    { skip: !open || !estimateId }
  )

  const handleConfirmComplete = async () => {
    if (!project?.id) return
    try {
      await completeProject(project.id).unwrap()
      toast.success(
        t('projects.completeSuccess', {
          defaultValue: 'Project marked as completed',
        })
      )
      setConfirmOpen(false)
      onClose()
    } catch {
      toast.error(
        t('projects.completeError', {
          defaultValue: 'Failed to complete project',
        })
      )
    }
  }

  const preview = useMemo(() => {
    if (!project) return null

    const estimate = estimateResponse?.data
    const lineItems = estimate
      ? buildLineItemsFromEstimate(estimate)
      : (project.lineItems ?? [])
    const taxPercent = estimate?.taxNumber ?? project.taxPercent ?? 0
    const { subtotal, taxAmount, balanceDue } = computeProjectTotals(
      lineItems,
      Number(taxPercent),
      estimate?.totalCost ?? project.balanceDue
    )

    return {
      projectName: estimate?.projectName ?? project.projectName,
      customerName: estimate?.customerName ?? project.customerName,
      customerEmail: estimate?.customerEmail ?? project.customerEmail ?? '—',
      customerAddress: estimate?.customerAddress ?? project.location ?? '—',
      description: (estimate?.description ?? project.description)?.trim() || '—',
      startDate: estimate?.estimateStartDate ?? project.startDate,
      endDate: estimate?.estimateEndDate ?? project.endDate,
      lineItems,
      taxPercent: Number(taxPercent),
      subtotal,
      taxAmount,
      balanceDue,
      signatureUrl: project.signatureUrl,
      hasSignature: project.hasSignature,
      status: project.status,
    }
  }, [project, estimateResponse?.data])

  if (!project || !preview) return null



  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projects.previewTitle', { defaultValue: 'Estimate preview' })}
      size="xl"
      className="max-w-4xl bg-white sm:rounded-2xl"
      headerClassName="border-b border-gray-100 pb-4"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg border-gray-300 px-6 font-medium text-gray-800"
            onClick={onClose}
          >
            {t('common.close', { defaultValue: 'Close' })}
          </Button>
          {project.status !== 'Completed' ? (
            <Button
              type="button"
              className="h-10 rounded-lg bg-[#22c55e] px-6 font-semibold text-white hover:bg-[#16a34a]"
              onClick={() => setConfirmOpen(true)}
              disabled={isCompleting}
            >
              {t('projects.completeProject', { defaultValue: 'Complete Project' })}
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-6 pr-1">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#22c55e] text-sm font-bold text-white">
                MF
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{COMPANY_INFO.name}</p>
                <p className="text-sm text-gray-500">{COMPANY_INFO.tagline}</p>
              </div>
            </div>
            <div className="space-y-0.5 text-xs leading-relaxed text-gray-500">
              <p>{COMPANY_INFO.address}</p>
              <p>{COMPANY_INFO.phone}</p>
              <p>{COMPANY_INFO.email}</p>
            </div>
          </div>

          <div className="space-y-2 sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {t('projects.preparedFor', { defaultValue: 'Prepared for' })}
            </p>
            <p className="text-lg font-bold text-gray-900">{preview.customerName}</p>
            <p className="text-sm text-gray-500">{preview.customerEmail}</p>
            <p className="text-sm text-gray-500">{preview.customerAddress}</p>
            <p className="pt-2 text-sm font-medium text-gray-800">{preview.projectName}</p>
            <p className="whitespace-pre-wrap text-sm text-gray-600">{preview.description}</p>
            <p className="text-sm text-gray-500">
              {formatPreviewDateRange(preview.startDate, preview.endDate)}
            </p>
            <p className="text-xs font-medium text-gray-500">
              {t('projects.status', { defaultValue: 'Status' })}: {preview.status}
            </p>
          </div>
        </div>

        {isEstimateLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {t('common.loading', { defaultValue: 'Loading...' })}
          </p>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#ecfdf3] text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <th className="px-4 py-3">{t('projects.item', { defaultValue: 'Item' })}</th>
                    <th className="px-4 py-3 text-center">
                      {t('projects.quantity', { defaultValue: 'Quantity' })}
                    </th>
                    <th className="px-4 py-3 text-right">
                      {t('projects.unitPrice', { defaultValue: 'Unit price' })}
                    </th>
                    <th className="px-4 py-3 text-right">
                      {t('projects.totalPrice', { defaultValue: 'Total Price' })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                        {t('projects.noLineItems', { defaultValue: 'No line items' })}
                      </td>
                    </tr>
                  ) : (
                    preview.lineItems.map((row, index) => (
                      <tr key={`${row.name}-${index}`} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{row.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {fmtProjectMoney(row.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {fmtProjectMoney(row.totalPrice)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{t('projects.subtotal', { defaultValue: 'Subtotal' })}</span>
                  <span>{fmtProjectMoney(preview.subtotal)}</span>
                </div>
                {/* <div className="flex justify-between text-gray-500">
                  <span>
                    {t('projects.tax', {
                      defaultValue: 'Tax ({{percent}}%)',
                      percent: preview.taxPercent,
                    })}
                  </span>
                  <span>{fmtProjectMoney(preview.taxAmount)}</span>
                </div> */}
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>{t('projects.balanceDue', { defaultValue: 'Total cost' })}</span>
                  <span className="text-[#22c55e]">{fmtProjectMoney(preview.balanceDue)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {preview.hasSignature && preview.signatureUrl ? (
          <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-sm font-semibold text-gray-800">
              {t('projects.signature', { defaultValue: 'Customer signature' })}
            </p>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <img
                src={imageUrl(preview.signatureUrl)}
                alt={t('projects.signature', { defaultValue: 'Customer signature' })}
                className="mx-auto max-h-32 w-full object-contain"
              />
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmComplete}
        title={t('projects.completeConfirmTitle', {
          defaultValue: 'Complete this project?',
        })}
        description={t('projects.completeConfirmDescription', {
          defaultValue:
            'Are you sure your project is complete? This will mark the project as COMPLETED.',
        })}
        confirmText={t('projects.completeConfirm', { defaultValue: 'Yes, complete' })}
        cancelText={t('common.cancel', { defaultValue: 'Cancel' })}
        variant="info"
        isLoading={isCompleting}
      />
    </ModalWrapper>
  )
}
