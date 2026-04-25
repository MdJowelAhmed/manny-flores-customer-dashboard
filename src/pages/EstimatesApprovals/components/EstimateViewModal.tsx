import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  fmtUsd,
  getDetailBreakdownForEstimate,
  type Estimate,
} from '../estimatesData'

interface EstimateViewModalProps {
  open: boolean
  onClose: () => void
  estimate: Estimate | null
  onApprove?: (estimate: Estimate) => void
  onReject?: (estimate: Estimate) => void
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <div className="space-y-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        {children}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-gray-500">{label}:</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  )
}

export function EstimateViewModal({
  open,
  onClose,
  estimate,
  onApprove,
  onReject,
}: EstimateViewModalProps) {
  const { t } = useTranslation()
  if (!estimate) return null

  const d = getDetailBreakdownForEstimate(estimate)

  const handleApprove = () => {
    onApprove?.(estimate)
    onClose()
  }

  const handleReject = () => {
    onReject?.(estimate)
    onClose()
  }

  const canRespond = estimate.status === 'Pending'

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={estimate.estimateCode}
      size="lg"
      className="max-w-2xl bg-[#f0f0f0] sm:rounded-xl"
      headerClassName="pb-2"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md border-gray-300 bg-white font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            onClick={handleReject}
            disabled={!canRespond}
          >
            {t('estimates.reject')}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-md  font-semibold text-white "
            onClick={handleApprove}
            disabled={!canRespond}
          >
            {t('estimates.approved')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 pb-1">
        <SectionCard title={t('estimates.sectionLabor')}>
          <DetailRow label={t('estimates.quantity')} value={String(d.labor.quantity)} />
          <DetailRow label={t('estimates.price')} value={fmtUsd(d.labor.price)} />
        </SectionCard>

        <SectionCard title={t('estimates.sectionMaterial')}>
          <DetailRow label={t('estimates.name')} value={d.material.name} />
          <DetailRow label={t('estimates.quantity')} value={String(d.material.quantity)} />
          <DetailRow
            label={d.material.unitPriceLabel}
            value={fmtUsd(d.material.unitPrice)}
          />
          <DetailRow
            label={t('estimates.totalPrice')}
            value={fmtUsd(d.material.totalPrice)}
          />
        </SectionCard>

        <SectionCard title={t('estimates.sectionEquipment')}>
          <DetailRow label={t('estimates.name')} value={d.equipment.name} />
          <DetailRow label={t('estimates.quantity')} value={String(d.equipment.quantity)} />
          <DetailRow
            label={d.equipment.unitPriceLabel}
            value={fmtUsd(d.equipment.unitPrice)}
          />
          <DetailRow
            label={t('estimates.totalPrice')}
            value={fmtUsd(d.equipment.totalPrice)}
          />
        </SectionCard>

        <SectionCard title={t('estimates.sectionPrice')}>
          <DetailRow
            label={t('estimates.totalPrice')}
            value={fmtUsd(d.price.totalPrice)}
          />
          <DetailRow
            label={t('estimates.taxOptional')}
            value={
              d.price.taxPercent != null ? `${d.price.taxPercent}%` : '—'
            }
          />
        </SectionCard>
      </div>
    </ModalWrapper>
  )
}
